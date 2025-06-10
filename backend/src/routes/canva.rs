use crate::routes::state::{AppState, CanvasSize};
use axum::{extract::State, response::Json};

pub async fn get_canvas_size(State(state): State<AppState>) -> Json<CanvasSize> {
    Json(state.canvas_size.as_ref().clone())
}

pub async fn get_delay(State(state): State<AppState>) -> Json<u32> {
    Json(state.delay)
}

pub async fn spa_fallback() -> axum::response::Html<String> {
    let html =
        std::fs::read_to_string("static/index.html").unwrap_or_else(|_| "<h1>404</h1>".to_string());
    axum::response::Html(html)
}
