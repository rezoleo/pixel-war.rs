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

pub async fn get_all_pixels() -> Json<Vec<u8>> {
    match fs::read(PIXEL_FILE_PATH) {
        Ok(data) => Json(data),
        Err(_) => Json(vec![]), // Optional: could return error status instead
    }
}

pub async fn get_pixel_region(
    State(size): State<Arc<CanvasSize>>,
    Json(region): Json<PixelRegionRequest>,
) -> impl IntoResponse {
    let Ok(data) = fs::read(PIXEL_FILE_PATH) else {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(vec![]));
    };

    let x_start = region.xStart;
    let x_end = region.xEnd;
    let y_start = region.yStart;
    let y_end = region.yEnd;

    // Validate region bounds
    if x_start > x_end || y_start > y_end || x_end >= size.width || y_end >= size.height {
        return (StatusCode::BAD_REQUEST, Json(vec![]));
    }

    let mut region_bytes = Vec::new();
    for y in y_start..=y_end {
        for x in x_start..=x_end {
            let idx = y * size.width + x;
            if let Some(byte) = data.get(idx as usize) {
                region_bytes.push(*byte);
            }
        }
    }

    (StatusCode::OK, Json(region_bytes))
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
