use crate::routes::admin::is_user_admin;
use crate::routes::state::{
    AppState, COLORS, CanvasSize, PIXEL_FILE_PATH, PixelRange, PixelRegionRequest, PixelRequest,
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
    state: &AppState,
) -> std::io::Result<()> {
    let size = &state.canvas_size;

    // Compute pixel index and offset
    let pixel_index = (y * size.width + x) as u64;
    let offset = pixel_index / 2; // Two pixels per byte

    // Locking file access, unlock when going out of scope
    let _guard = state.file_lock.lock().await;

    // Open file
    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        .open(PIXEL_FILE_PATH)?;

    // Seek and read current byte
    file.seek(SeekFrom::Start(offset))?;
    let mut byte = [0u8];
    file.read_exact(&mut byte)?;
    file.seek(SeekFrom::Start(offset))?; // Re-seek after reading

    // Update the correct nibble
    let updated_byte = if pixel_index % 2 == 0 {
        // Even pixel: high nibble
        (byte[0] & 0x0F) | (color_index << 4)
    } else {
        // Odd pixel: low nibble
        (byte[0] & 0xF0) | color_index
    };

    // Write updated byte
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
    let ip = get_ip(&headers);
    if !is_request_allowed(&ip, &state).await {
        tracing::warn!("Request from {} is not allowed due to rate limiting", ip);
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json("Too many requests, please try again later"),
        );
    }

    let size = &state.canvas_size;

    if request.x < size.width && request.y < size.height && COLORS.contains(&request.color.as_str())
    {
        let color_index = COLORS
            .iter()
            .position(|&c| c == request.color)
            .expect("Color not found in COLORS array") as u8;

        match write_pixel_data_locked(&request.x, &request.y, &color_index, &state).await {
            Ok(_) => {
                tracing::info!(
                    "Pixel updated at ({}, {}) with color {}",
                    request.x,
                    request.y,
                    request.color
                );
                (StatusCode::OK, Json("Pixel updated successfully"))
            }
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

pub async fn get_all_pixels() -> Json<String> {
    match fs::read(PIXEL_FILE_PATH) {
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
    let size = &state.canvas_size;

    let Ok(data) = fs::read(PIXEL_FILE_PATH) else {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(String::new()));
    };

    let x_start = region.xStart;
    let x_end = region.xEnd;
    let y_start = region.yStart;
    let y_end = region.yEnd;

    if x_start > x_end || y_start > y_end || x_end >= size.width || y_end >= size.height {
        return (StatusCode::BAD_REQUEST, Json(String::new()));
    }

    let mut hex_string =
        String::with_capacity(((x_end - x_start + 1) * (y_end - y_start + 1)) as usize);

    for y in y_start..=y_end {
        for x in x_start..=x_end {
            let idx = y * size.width + x;
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
    let width = state.canvas_size.width;
    let height = state.canvas_size.height;

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
        .open(PIXEL_FILE_PATH)?;

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
