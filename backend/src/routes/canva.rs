use crate::routes::state::{AppState, CanvasSize};
use axum::{extract::State, response::Json};

pub async fn get_canvas_size(State(state): State<AppState>) -> Json<CanvasSize> {
    let canvas_size = state.canvas_size.lock().await;
    Json(CanvasSize {
        width: canvas_size.width,
        height: canvas_size.height,
    })
}

pub async fn get_delay(State(state): State<AppState>) -> Json<u32> {
    let delay = state.delay.lock().await;
    Json(*delay)
}

pub async fn spa_fallback() -> axum::response::Html<String> {
    let html =
        std::fs::read_to_string("static/index.html").unwrap_or_else(|_| "<h1>404</h1>".to_string());
    axum::response::Html(html)
}

pub async fn get_active(State(state): State<AppState>) -> Json<serde_json::Value> {
    let active = state.active.lock().await;
    Json(serde_json::json!({ "active": *active }))
}
