use crate::config::AuthConfig;
use axum_extra::extract::cookie::Key;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc, time::SystemTime};
use tokio::sync::Mutex;

#[derive(Serialize, Deserialize, Clone)]
pub struct CanvasSize {
    pub width: u32,
    pub height: u32,
}

pub const COLORS: [&'static str; 16] = [
    "#FFFFFF", "#E4E4E4", "#888888", "#222222", "#FFA7D1", "#E50000", "#E59500", "#A06A42",
    "#E5D900", "#94E044", "#02BE01", "#00D3DD", "#0083C7", "#0000EA", "#CD6EEA", "#820080",
];

#[derive(Deserialize)]
pub struct Pixel {
    pub x: u32,
    pub y: u32,
}

#[derive(Deserialize)]
pub struct PixelRange {
    pub start: Pixel,
    pub end: Pixel,
}

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
    pub canvas_size: Arc<Mutex<CanvasSize>>,
    pub file_lock: Arc<Mutex<()>>, // dummy mutex for synchronizing file access
    pub delay: Arc<Mutex<u32>>,    // default delay value in seconds
    pub ip_timestamps: Arc<Mutex<HashMap<String, SystemTime>>>, // track IP cooldown
    pub auth: AuthConfig,
    pub cookie_key: Key,
    pub file_path: Arc<String>,
    pub active: Arc<Mutex<bool>>,
}
