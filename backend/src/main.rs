use axum::{
    Router,
    extract::State,
    response::{Html, IntoResponse, Json},
    routing::{get, post},
};
use serde::Serialize;
use std::fs;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer}; // Import CorsLayer
use tower_http::services::ServeDir;
use tracing_subscriber;

const COLORS: [&str; 16] = [
    "#FFFFFF", "#E4E4E4", "#888888", "#222222", "#FFA7D1", "#E50000", "#E59500", "#A06A42",
    "#E5D900", "#94E044", "#02BE01", "#00D3DD", "#0083C7", "#0000EA", "#CD6EEA", "#820080",
];

const ADDRESS: &str = "127.0.0.1:3000";

#[derive(Serialize, Clone)]
struct CanvasSize {
    width: u32,
    height: u32,
}

#[derive(serde::Deserialize)]
struct PixelRequest {
    x: u32,
    y: u32,
    color: String,
}

async fn handle_pixel_request(
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

async fn get_canvas_size(State(size): State<Arc<CanvasSize>>) -> Json<CanvasSize> {
    Json(size.as_ref().clone())
}

async fn spa_fallback() -> impl IntoResponse {
    let html = fs::read_to_string("frontend/dist/index.html")
        .unwrap_or_else(|_| "<h1>404</h1>".to_string());
    Html(html)
}

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    let canvas_size = Arc::new(CanvasSize {
        width: 80,
        height: 80,
    });

    // Define CORS layer
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any);

    // Build our application with a route and CORS middleware
    let app = Router::new()
        .route("/api/size", get(get_canvas_size))
        .route("/api/pixel", post(handle_pixel_request))
        .fallback_service(ServeDir::new("./frontend/dist").not_found_service(get(spa_fallback)))
        .with_state(canvas_size)
        .layer(cors);

    // Bind to address
    let listener = tokio::net::TcpListener::bind(ADDRESS)
        .await
        .expect("Failed to bind address");

    tracing::info!("Listening on http://{}", ADDRESS);

    // Serve the application
    axum::serve(listener, app).await.expect("Server error");
}
