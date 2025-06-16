use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct AuthConfig {
    pub admin_hashed_password: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct CookieConfig {
    pub key_base64: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct FileConfig {
    pub width: u32,
    pub height: u32,
    pub delay: u32,
    pub file_path: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct StateConfig {
    pub active: bool,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AppConfig {
    pub auth: AuthConfig,
    pub cookies: CookieConfig,
    pub file: FileConfig,
    pub state: StateConfig,
}

impl AppConfig {
    pub fn from_file() -> Self {
        config::Config::builder()
            .add_source(config::File::with_name("config"))
            .build()
            .expect("Failed to load config")
            .try_deserialize()
            .expect("Failed to deserialize config")
    }
}
