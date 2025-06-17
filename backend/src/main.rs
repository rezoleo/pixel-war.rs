mod config;
mod routes;
mod utils;

use crate::config::AppConfig;
use crate::routes::{admin::*, canva::*, pixel::*, state::*};
use axum::extract::FromRef;
use axum::{
    Router,
    routing::{get, post},
};
use axum_extra::extract::cookie::Key;
use base64::engine::{Engine, general_purpose};
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tokio::sync::Mutex;
use tower_http::services::ServeDir;
use tracing_subscriber;

impl FromRef<AppState> for Key {
    fn from_ref(app_state: &AppState) -> Key {
        app_state.cookie_key.clone()
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let config = AppConfig::from_file();

    let key_bytes = general_purpose::STANDARD
        .decode(&config.cookies.key_base64)
        .expect("Invalid base64 cookie key");

    let key = Key::from(&key_bytes); // use slice &[u8] to build cookie Key

    let canvas_size = Arc::new(Mutex::new(CanvasSize {
        width: config.file.width,
        height: config.file.height,
    }));

    let shared_state = AppState {
        canvas_size: Arc::clone(&canvas_size),
        file_lock: Arc::new(Mutex::new(())),
        delay: Arc::new(Mutex::new(config.file.delay)),
        ip_timestamps: Arc::new(Mutex::new(HashMap::new())),
        cookie_key: key,
        auth: config.auth,
        file_path: Arc::new(config.file.file_path.clone()),
        active: Arc::new(Mutex::new(config.state.active)),
    };

    // Initialize the pixel file if it doesn't exist
    // Uncomment the following lines if you want to initialize the pixel file
    // {
    //     let canvas_size_guard = canvas_size.lock().await;
    //     init_pixel_file("state/pixels.bin", &*canvas_size_guard)
    //         .expect("Failed to init pixels.bin");
    // }

    let app = Router::new()
        .route("/api/size", get(get_canvas_size))
        .route("/api/pixel", post(handle_pixel_request))
        .route("/api/pixels", get(get_all_pixels))
        .route("/api/pixels", post(get_pixel_region))
        .route("/api/delay", get(get_delay))
        .route("/api/active", get(get_active))
        .route("/api/admin-login", post(admin_login))
        .route("/api/admin/pixels", post(admin_whitening))
        .route("/api/admin/size", post(update_canvas_size))
        .route("/api/admin/active", post(update_admin_active))
        .route("/api/admin/reset", post(admin_reset))
        .route("/api/admin/delay", post(admin_update_delay))
        .route("/api/me", get(me))
        .fallback_service(ServeDir::new("static/").not_found_service(get(spa_fallback)))
        .with_state(shared_state);

    let listener = tokio::net::TcpListener::bind(&config.state.address)
        .await
        .expect("Failed to bind address");

    tracing::info!("Listening on http://{}", &config.state.address);
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .expect("Server error");
}
