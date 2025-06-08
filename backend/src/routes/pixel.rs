use crate::routes::state::{COLORS, CanvasSize, PIXEL_FILE_PATH, PixelRegionRequest, PixelRequest};
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Json},
};
use std::fs;
use std::io::Write;
use std::path::Path;
use std::sync::Arc;

fn write_prixel_data(x: &i32, y: &i32, color: &str) -> std::io::Result<()> {
    let mut file = fs::OpenOptions::new()
        .write(true)
        .append(true)
        .open(PIXEL_FILE_PATH)?;

    // Convert color to a byte representation (for simplicity, using index of color)
    if let Some(index) = COLORS.iter().position(|&c| c == color) {
        let byte = index as u8;
        file.write_all(&[byte])?;
    } else {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "Invalid color",
        ));
    }

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
    State(size): State<Arc<CanvasSize>>,
    Json(request): Json<PixelRequest>,
) -> impl IntoResponse {
    if request.x < size.width && request.y < size.height && COLORS.contains(&request.color.as_str())
    {
        // Here you would handle the pixel update logic
        tracing::info!(
            "Received pixel update at ({}, {}) with color {}",
            request.x,
            request.y,
            request.color
        );
        Json("Pixel updated successfully")
    } else {
        tracing::warn!(
            "Received pixel update out of bounds: ({}, {})",
            request.x,
            request.y
        );
        Json("Pixel update out of bounds")
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
    State(size): State<Arc<CanvasSize>>,
    Json(region): Json<PixelRegionRequest>,
) -> impl IntoResponse {
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
