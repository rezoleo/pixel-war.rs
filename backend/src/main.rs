mod routes;
mod utils;

use crate::routes::{canva::*, pixel::*, state::*};
use axum::{
    Router,
    routing::{get, post},
};
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tokio::sync::Mutex;
use tower_http::services::ServeDir;
use tracing_subscriber;

const ADDRESS: &str = "127.0.0.1:3000";

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let canvas_size = Arc::new(CanvasSize {
        width: 80,
        height: 80,
    });

    let shared_state = AppState {
        canvas_size: Arc::clone(&canvas_size),
        file_lock: Arc::new(Mutex::new(())),
        delay: 5,
        ip_timestamps: Arc::new(Mutex::new(HashMap::new())),
    };

    // utils::init_pixel_file("state/pixels.bin", &canvas_size).expect("Failed to init pixels.bin");

    let app = Router::new()
        .route("/api/size", get(get_canvas_size))
        .route("/api/pixel", post(handle_pixel_request))
        .route("/api/pixels", get(get_all_pixels))
        .route("/api/pixels", post(get_pixel_region))
        .route("/api/delay", get(get_delay))
        .fallback_service(ServeDir::new("./frontend/dist").not_found_service(get(spa_fallback)))
        .with_state(shared_state);

    let listener = tokio::net::TcpListener::bind(ADDRESS)
        .await
        .expect("Failed to bind address");

    tracing::info!("Listening on http://{}", ADDRESS);
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .expect("Server error");
}
