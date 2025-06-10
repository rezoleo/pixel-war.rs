use crate::routes::state::AppState;
use axum::{
    Json,
    extract::{Form, State},
    response::{IntoResponse, Redirect},
};
use axum_extra::extract::cookie::{Cookie, PrivateCookieJar};
use bcrypt::verify;
use serde::{Deserialize, Serialize};

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
        (jar, Redirect::to("/admin-control"))
    } else {
        (jar, Redirect::to("/admin-login?error=bad_password"))
    }
}

pub async fn me(State(_state): State<AppState>, jar: PrivateCookieJar) -> impl IntoResponse {
    let is_admin = jar
        .get("admin")
        .map(|cookie| cookie.value() == "true")
        .unwrap_or(false);

    Json(UserInfo { admin: is_admin })
}
