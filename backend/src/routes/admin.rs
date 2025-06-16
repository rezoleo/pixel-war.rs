use crate::routes::{
    pixel::{init_pixel_file, resize_canvas_locked},
    state::{AppState, CanvasSize},
};
use axum::{
    Json,
    extract::{Form, State},
    http::StatusCode,
    response::IntoResponse,
};
use axum_extra::extract::cookie::{Cookie, PrivateCookieJar};
use bcrypt::verify;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;

#[derive(Deserialize)]
pub struct LoginForm {
    password: String,
}

#[derive(Serialize)]
struct UserInfo {
    admin: bool,
}

pub async fn admin_login(
    State(state): State<AppState>,
    jar: PrivateCookieJar,
    Form(form): Form<LoginForm>,
) -> impl IntoResponse {
    let hashed = &state.auth.admin_hashed_password;

    if verify(&form.password, hashed).unwrap_or(false) {
        let mut cookie = Cookie::new("admin", "true");
        cookie.set_http_only(true);
        cookie.set_max_age(time::Duration::hours(12));
        cookie.set_path("/");

        let jar = jar.add(cookie);
        (
            jar,
            (
                StatusCode::OK,
                Json(serde_json::json!({ "message": "Login successful" })),
            ),
        )
    } else {
        (
            jar,
            (
                StatusCode::UNAUTHORIZED,
                Json(serde_json::json!({ "error": "Bad Password" })),
            ),
        )
    }
}

pub async fn me(State(_state): State<AppState>, jar: PrivateCookieJar) -> impl IntoResponse {
    let is_admin = jar
        .get("admin")
        .map(|cookie| cookie.value() == "true")
        .unwrap_or(false);

    Json(UserInfo { admin: is_admin })
}

pub fn is_user_admin(jar: &PrivateCookieJar) -> bool {
    jar.get("admin")
        .map(|cookie| cookie.value() == "true")
        .unwrap_or(false)
}

pub async fn update_canvas_size(
    State(state): State<AppState>,
    jar: PrivateCookieJar,
    Json(payload): Json<CanvasSize>,
) -> impl IntoResponse {
    if !is_user_admin(&jar) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Unauthorized" })),
        );
    }
    tracing::info!(
        "Admin requested canvas resize to {}x{}",
        payload.width,
        payload.height
    );
    match resize_canvas_locked(payload.width, payload.height, &state).await {
        Ok(_) => (
            StatusCode::OK,
            Json(json!({ "message": "Canvas size updated successfully" })),
        ),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": format!("Failed to resize canvas: {}", e) })),
        ),
    }
}

pub async fn update_admin_active(
    State(state): State<AppState>,
    jar: PrivateCookieJar,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    if !is_user_admin(&jar) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Unauthorized" })),
        );
    }

    let active = payload
        .get("active")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let mut active_lock = state.active.lock().await;
    *active_lock = active;

    (
        StatusCode::OK,
        Json(json!({ "message": "State updated successfully" })),
    )
}

pub async fn admin_reset(
    State(state): State<AppState>,
    jar: PrivateCookieJar,
    Json(canvas_size): Json<CanvasSize>,
) -> impl IntoResponse {
    if !is_user_admin(&jar) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Unauthorized" })),
        );
    }

    // Prepare file paths
    let pixel_file_path = &*state.file_path;

    // Get current date as YYYY-MM-DD without chrono
    let now = std::time::SystemTime::now();
    let datetime: time::OffsetDateTime = now.into();
    let date_str = format!(
        "{:04}-{:02}-{:02}",
        datetime.year(),
        datetime.month() as u8,
        datetime.day()
    );
    let backup_path = format!("{}-{}", pixel_file_path, date_str);

    // Try to copy the file before resetting
    if let Err(e) = fs::copy(pixel_file_path, &backup_path) {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": format!("Failed to backup canvas file: {}", e) })),
        );
    }

    // Reset the canvas file
    match init_pixel_file(pixel_file_path, &canvas_size) {
        Ok(_) => {
            // Reset the canvas size in the state
            let mut canvas_size_lock = state.canvas_size.lock().await;
            *canvas_size_lock = canvas_size;
            (
                StatusCode::OK,
                Json(json!({ "message": "Canvas reset successfully" })),
            )
        }
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": format!("Failed to reset canvas: {}", e) })),
        ),
    }
}

pub async fn admin_update_delay(
    State(state): State<AppState>,
    jar: PrivateCookieJar,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    if !is_user_admin(&jar) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Unauthorized" })),
        );
    }

    let delay = match payload.get("delay").and_then(|v| v.as_u64()) {
        Some(d) => d as u32,
        None => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": "Missing or invalid 'delay' field" })),
            );
        }
    };

    let mut state_lock = state.delay.lock().await;
    *state_lock = delay;

    (
        StatusCode::OK,
        Json(json!({ "message": "Delay updated successfully" })),
    )
}
