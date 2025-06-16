use crate::routes::{
    pixel::resize_canvas_locked,
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
        use axum::http::StatusCode;
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
