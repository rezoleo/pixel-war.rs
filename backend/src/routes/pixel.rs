use crate::routes::admin::is_user_admin;
use crate::routes::state::{
    AppState, COLORS, CanvasSize, PixelRange, PixelRegionRequest, PixelRequest,
};

use crate::utils::requests::{get_ip, is_request_allowed};
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Json},
};
use axum_extra::extract::cookie::PrivateCookieJar;
use serde_json::json;
use std::fs::{self, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::Path;

async fn write_pixel_data_locked(
    x: &u32,
    y: &u32,
    color_index: &u8,
    size: &CanvasSize,
    state: &AppState,
) -> std::io::Result<()> {
    // Compute pixel index and offset
    let pixel_index = (y * size.width + x) as u64;
    let offset = pixel_index / 2; // Two pixels per byte
    let file_path = &state.file_path;
    // Locking file access
    let _guard = state.file_lock.lock().await;

    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        .open(file_path.as_str())?;

    file.seek(SeekFrom::Start(offset))?;
    let mut byte = [0u8];
    file.read_exact(&mut byte)?;
    file.seek(SeekFrom::Start(offset))?;

    let updated_byte = if pixel_index % 2 == 0 {
        (byte[0] & 0x0F) | (color_index << 4)
    } else {
        (byte[0] & 0xF0) | color_index
    };

    file.write_all(&[updated_byte])?;

    Ok(())
}

fn nibble_to_hex(n: u8) -> char {
    match n {
        0..=9 => (b'0' + n) as char,
        10..=15 => (b'a' + (n - 10)) as char,
        _ => '?', // Should never happen with 4-bit nibbles
    }
}

pub async fn handle_pixel_request(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(request): Json<PixelRequest>,
) -> impl IntoResponse {
    let active_guard = state.active.lock().await;
    if !*active_guard {
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            Json("Service is currently unavailable"),
        );
    }
    let ip = get_ip(&headers);
    if !is_request_allowed(&ip, &state).await {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json("Too many requests, please try again later"),
        );
    }

    let size_guard = state.canvas_size.lock().await;

    if request.x < size_guard.width
        && request.y < size_guard.height
        && COLORS.contains(&request.color.as_str())
    {
        let color_index = COLORS
            .iter()
            .position(|&c| c == request.color)
            .expect("Color not found in COLORS array") as u8;

        match write_pixel_data_locked(&request.x, &request.y, &color_index, &size_guard, &state)
            .await
        {
            Ok(_) => (StatusCode::OK, Json("Pixel updated successfully")),
            Err(e) => {
                tracing::error!("Failed to write pixel data: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json("Failed to write pixel"),
                )
            }
        }
    } else {
        tracing::warn!(
            "Received pixel update out of bounds or invalid color: ({}, {})",
            request.x,
            request.y
        );
        (StatusCode::BAD_REQUEST, Json("Invalid pixel data"))
    }
}

pub async fn get_all_pixels(State(state): State<AppState>) -> Json<String> {
    let file_path = &state.file_path;
    match fs::read(file_path.as_str()) {
        Ok(data) => {
            let hex_string = data
                .iter()
                .flat_map(|byte| {
                    let hi = byte >> 4;
                    let lo = byte & 0x0F;
                    [nibble_to_hex(hi), nibble_to_hex(lo)]
                })
                .collect();
            Json(hex_string)
        }
        Err(_) => Json(String::new()),
    }
}

pub async fn get_pixel_region(
    State(state): State<AppState>,
    Json(region): Json<PixelRegionRequest>,
) -> impl IntoResponse {
    let size_guard = state.canvas_size.lock().await;
    let file_path = &state.file_path;

    let Ok(data) = fs::read(file_path.as_str()) else {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(String::new()));
    };

    let x_start = region.xStart;
    let x_end = region.xEnd;
    let y_start = region.yStart;
    let y_end = region.yEnd;

    if x_start > x_end || y_start > y_end || x_end >= size_guard.width || y_end >= size_guard.height
    {
        return (StatusCode::BAD_REQUEST, Json(String::new()));
    }

    let mut hex_string =
        String::with_capacity(((x_end - x_start + 1) * (y_end - y_start + 1)) as usize);

    for y in y_start..=y_end {
        for x in x_start..=x_end {
            let idx = y * size_guard.width + x;
            let byte_index = idx / 2;
            let high_nibble = idx % 2 == 0;

            if let Some(byte) = data.get(byte_index as usize) {
                let nibble = if high_nibble { byte >> 4 } else { byte & 0x0F };
                hex_string.push(nibble_to_hex(nibble));
            }
        }
    }

    (StatusCode::OK, Json(hex_string))
}

#[allow(dead_code)]
pub fn init_pixel_file(path: &str, size: &CanvasSize) -> std::io::Result<()> {
    if size.width % 2 != 0 || size.height % 2 != 0 {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "Width and height must be even numbers",
        ));
    }

    let byte_count = (size.width * size.height) / 2;
    let buffer = vec![0u8; byte_count as usize];

    if let Some(parent) = Path::new(path).parent() {
        fs::create_dir_all(parent)?;
    }

    let mut file = fs::File::create(path)?;
    file.write_all(&buffer)?;
    Ok(())
}

pub async fn admin_whitening(
    State(state): State<AppState>,
    jar: PrivateCookieJar,
    Json(payload): Json<PixelRange>,
) -> impl IntoResponse {
    if !is_user_admin(&jar) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Unauthorized" })),
        );
    }

    let start = payload.start;
    let end = payload.end;

    let x_min = start.x.min(end.x);
    let y_min = start.y.min(end.y);
    let x_max = start.x.max(end.x);
    let y_max = start.y.max(end.y);

    match whiten_area(x_min, y_min, x_max, y_max, &state).await {
        Ok(_) => (
            StatusCode::OK,
            Json(json!({ "message": "Pixels whitened successfully" })),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": format!("Failed to whiten pixels: {}", e) })),
        ),
    }
}

async fn whiten_area(
    x_min: u32,
    y_min: u32,
    x_max: u32,
    y_max: u32,
    state: &AppState,
) -> std::io::Result<()> {
    let canvas_size = state.canvas_size.lock().await;
    let file_path = &state.file_path;
    let width = canvas_size.width;
    let height = canvas_size.height;

    // Bounds check
    if x_min > x_max || y_min > y_max || x_max >= width || y_max >= height {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "Invalid coordinates for whitening",
        ));
    }

    // Prepare the lock for exclusive file access
    let _guard = state.file_lock.lock().await;

    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        .open(file_path.as_str())?;

    let start_offset = (y_min * width + x_min) / 2;
    let bytes_per_row = ((x_max - x_min) / 2) + 1;
    let blank_row = vec![0u8; bytes_per_row as usize];
    let bytes_per_canvas_row = width / 2;

    let mut offset = start_offset;

    for _ in y_min..=y_max {
        file.seek(SeekFrom::Start(offset as u64))?;
        file.write_all(&blank_row)?;
        offset += bytes_per_canvas_row;
    }

    Ok(())
}

pub async fn resize_canvas_locked(
    new_width: u32,
    new_height: u32,
    state: &AppState,
) -> std::io::Result<()> {
    let mut canvas_size_guard = state.canvas_size.lock().await;
    let file_path = &state.file_path;
    let old_width = canvas_size_guard.width;
    let old_height = canvas_size_guard.height;

    tracing::info!(
        "Resizing canvas from {}x{} to {}x{}",
        old_width,
        old_height,
        new_width,
        new_height
    );

    // Validation
    if new_width % 2 != 0 || new_height % 2 != 0 {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "Width and height must be even numbers",
        ));
    }

    if new_width < old_width || new_height < old_height {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "New dimensions must be at least as large as the old ones",
        ));
    }

    let _file_guard = state.file_lock.lock().await;

    // Step 1: Add padding to each existing row
    {
        let mut file = OpenOptions::new()
            .read(true)
            .write(true)
            .open(file_path.as_str())?;

        let row_size_old = old_width / 2;
        let row_padding = (new_width - old_width) / 2;
        let mut offset = 0u64;

        for _ in 0..old_height {
            offset += row_size_old as u64;
            file.seek(SeekFrom::Start(offset))?;
            let mut rest_of_data = Vec::new();
            file.read_to_end(&mut rest_of_data)?;
            file.seek(SeekFrom::Start(offset))?;
            file.write_all(&vec![0u8; row_padding as usize])?;
            file.write_all(&rest_of_data)?;
            offset += row_padding as u64;
        }
    }

    // Step 2: Append new rows
    {
        let extra_rows = new_height - old_height;
        let row_size_new = (new_width / 2) as usize;
        let padding = vec![0u8; extra_rows as usize * row_size_new];

        let mut file = OpenOptions::new().append(true).open(file_path.as_str())?;
        file.write_all(&padding)?;
    }

    // Step 4: Update in-memory state
    canvas_size_guard.width = new_width;
    canvas_size_guard.height = new_height;

    Ok(())
}
