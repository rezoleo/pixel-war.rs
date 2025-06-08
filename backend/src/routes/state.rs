use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Serialize, Clone)]
pub struct CanvasSize {
    pub width: u32,
    pub height: u32,
}

pub const PIXEL_FILE_PATH: &'static str = "state/pixels.bin";
pub const COLORS: [&'static str; 16] = [
    "#FFFFFF", "#E4E4E4", "#888888", "#222222", "#FFA7D1", "#E50000", "#E59500", "#A06A42",
    "#E5D900", "#94E044", "#02BE01", "#00D3DD", "#0083C7", "#0000EA", "#CD6EEA", "#820080",
];

#[derive(Deserialize)]
pub struct PixelRequest {
    pub x: u32,
    pub y: u32,
    pub color: String,
}

#[derive(Deserialize)]
pub struct PixelRegionRequest {
    pub xStart: u32,
    pub yStart: u32,
    pub xEnd: u32,
    pub yEnd: u32,
}

#[derive(Clone)]
pub struct AppState {
    pub canvas_size: Arc<CanvasSize>,
    pub file_lock: Arc<Mutex<()>>, // dummy mutex for synchronizing file access
}
