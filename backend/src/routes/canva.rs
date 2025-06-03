use crate::routes::state::CanvasSize;
use axum::{extract::State, response::Json};
use std::sync::Arc;

pub async fn get_canvas_size(State(size): State<Arc<CanvasSize>>) -> Json<CanvasSize> {
    Json(size.as_ref().clone())
}

pub async fn spa_fallback() -> axum::response::Html<String> {
    let html = std::fs::read_to_string("frontend/dist/index.html")
        .unwrap_or_else(|_| "<h1>404</h1>".to_string());
    axum::response::Html(html)
}
