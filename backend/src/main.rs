use axum::{Router, routing::get, response::{Json, Html, IntoResponse}};
use serde::Serialize;
use tower_http::cors::{Any, CorsLayer}; // Import CorsLayer
use tracing_subscriber;
use tower_http::services::ServeDir;
use std::fs;

const ADDRESS: &str = "127.0.0.1:3000";

#[derive(Serialize)]
struct Message {
    message: String,
}

async fn hello_world() -> Json<Message> {
    Json(Message {
        message: "Hello from Rust backend!".to_string(),
    })
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

    // Define CORS layer
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any);

    // Build our application with a route and CORS middleware
    let app = Router::new()
        .route("/api/hello", get(hello_world))
        .fallback_service(ServeDir::new("./frontend/dist").not_found_service(get(spa_fallback)))
        .layer(cors);

    // Bind to address
    let listener = tokio::net::TcpListener::bind(ADDRESS)
        .await
        .expect("Failed to bind address");

    tracing::info!("Listening on http://{}", ADDRESS);

    // Serve the application
    axum::serve(listener, app)
        .await
        .expect("Server error");
}
