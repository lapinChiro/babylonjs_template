use serde::{Deserialize, Serialize};
use sqlx::{
    PgPool,
    postgres::{PgConnectOptions, PgPoolOptions},
};
use std::{sync::OnceLock, time::Duration};

// PG Parameters
// https://docs.rs/sqlx/0.8.5/sqlx/postgres/struct.PgConnectOptions.html

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct Config {
    pub max_connections: u32,
    pub acquire_timeout: u64,
    pub idle_timeout: u64,
    pub pg_password: String,
    pub login_client_id: String,
    pub login_client_secret: String,
    pub login_callback_url: String,
}

static INSTANCE: OnceLock<Config> = OnceLock::new();

fn get_string_value(key: &str, default: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| default.to_string())
}

fn get_value<T>(key: &str, default: T) -> T
where
    T: std::str::FromStr,
{
    match std::env::var(key) {
        Ok(value) => value.parse::<T>().unwrap_or(default),
        Err(_) => default,
    }
}

impl Config {
    pub fn new() -> Self {
        let max_connections = get_value("MAX_CONNECTIONS", 10);
        let acquire_timeout = get_value("ACQUIRE_TIMEOUT", 300);
        let idle_timeout = get_value("IDLE_TIMEOUT", 600);
        let pg_password = get_string_value("PGPASSWORD", "pass");
        let login_client_id = get_string_value("LOGIN_CLIENT_ID", "client_id");
        let login_client_secret = get_string_value("LOGIN_CLIENT_SECRET", "client_secret");
        let login_callback_url =
            get_string_value("LOGIN_CALLBACK_URL", "http://localhost:8080/callback");

        Self {
            max_connections,
            acquire_timeout,
            idle_timeout,
            pg_password,
            login_client_id,
            login_client_secret,
            login_callback_url,
        }
    }

    pub async fn pg_pool(&self) -> Result<PgPool, sqlx::Error> {
        let connect_options = PgConnectOptions::new_without_pgpass().password(&self.pg_password);
        PgPoolOptions::new()
            .max_connections(self.max_connections)
            .acquire_timeout(Duration::from_secs(self.acquire_timeout))
            .idle_timeout(Duration::from_secs(self.idle_timeout))
            .connect_with(connect_options)
            .await
    }

    pub fn global() -> &'static Config {
        INSTANCE.get().expect("config is not initialized")
    }

    pub fn set_global(value: &Config) {
        INSTANCE.set(value.clone()).expect("config don't update");
    }

    pub fn setup() -> &'static Config {
        let config = Config::new();
        Self::set_global(&config);
        Self::global()
    }
}
