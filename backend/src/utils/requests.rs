use axum::http::HeaderMap;

use std::time::{Duration, SystemTime};

use crate::routes::state::AppState;

/// Get the IP address from headers or socket address, mimicking PHP's logic
pub fn get_ip(headers: &HeaderMap) -> String {
    if let Some(ip) = headers.get("HTTP_CLIENT_IP").and_then(|v| v.to_str().ok()) {
        return ip.to_string();
    }

    if let Some(ip) = headers
        .get("HTTP_X_FORWARDED_FOR")
        .and_then(|v| v.to_str().ok())
    {
        return ip.to_string();
    }

    if let Some(ip) = headers.get("REMOTE_ADDR").and_then(|v| v.to_str().ok()) {
        return ip.to_string();
    }

    "unknown".to_string()
}

pub async fn is_request_allowed(ip: &str, state: &AppState) -> bool {
    let mut timestamps = state.ip_timestamps.lock().await;

    let now = SystemTime::now();
    match timestamps.get(ip) {
        Some(&last_time) => {
            if let Ok(elapsed) = now.duration_since(last_time) {
                if elapsed >= Duration::from_secs(state.delay.into()) {
                    timestamps.insert(ip.to_string(), now);
                    true
                } else {
                    false
                }
            } else {
                // Clock went backwards
                timestamps.insert(ip.to_string(), now);
                true
            }
        }
        None => {
            timestamps.insert(ip.to_string(), now);
            true
        }
    }
}
