use std::sync::Arc;

use axum::{
    Extension, Json, Router,
    http::{Method, StatusCode},
    routing::{delete, get, post},
};
use common::config::Config;
use google_login::Oauth2Client;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use tower_http::cors::{AllowHeaders, AllowOrigin, CorsLayer};
use tower_sessions::{MemoryStore, SessionManagerLayer};

pub mod controllers;
pub mod error;

pub struct AppState {
    pub pg_pool: PgPool,
    pub oauth2_client: Oauth2Client,
}

#[tokio::main]
async fn main() {
    // initialize tracing
    logs::setup_tracing("api");
    let config = Config::setup();
    let pg_pool = config.pg_pool().await.unwrap();
    let oauth2_client = Oauth2Client::new(
        &config.login_client_id,
        &config.login_client_secret,
        &config.login_callback_url,
    );
    let app_state = Arc::new(AppState {
        pg_pool,
        oauth2_client,
    });

    // セッションの準備
    let secret = "1234567812345678123456781234567812345678123456781234567812345678";
    let key = tower_sessions::cookie::Key::from(secret.as_bytes());
    let session_store = MemoryStore::default();
    let session_layer = SessionManagerLayer::new(session_store)
        .with_secure(false)
        .with_private(key);

    // CORS
    let cors_layer = CorsLayer::new()
        .allow_credentials(true)
        .allow_origin(AllowOrigin::mirror_request())
        .allow_methods([Method::GET, Method::POST, Method::DELETE])
        .allow_headers(AllowHeaders::mirror_request());

    // build our application with a route
    let app = Router::new()
        // `GET /` goes to `root`
        .route("/", get(root))
        // `POST /users` goes to `create_user`
        .route("/users", post(create_user))
        .route("/logins", get(controllers::logins::new::execute))
        .route("/logins", post(controllers::logins::create::execute))
        .route("/logins", delete(controllers::logins::delete::execute))
        .route(
            "/logins/session",
            get(controllers::logins::session::execute),
        )
        .route("/memos", get(controllers::memos::list::execute))
        .route("/memos", post(controllers::memos::create::execute))
        .with_state(app_state)
        .layer(cors_layer)
        .layer(session_layer);

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(FromRow)]
struct MyType {
    sum: i32,
}

// basic handler that responds with a static string
async fn root(Extension(pg_pool): Extension<PgPool>) -> String {
    let res: MyType = sqlx::query_as("SELECT 1 + 1 AS sum")
        .fetch_one(&pg_pool)
        .await
        .unwrap();
    format!("Hello, World! The sum is: {}", res.sum)
}

async fn create_user(
    // this argument tells axum to parse the request body
    // as JSON into a `CreateUser` type
    Json(payload): Json<CreateUser>,
) -> (StatusCode, Json<User>) {
    // insert your application logic here
    let user = User {
        id: 1337,
        username: payload.username,
    };

    // this will be converted into a JSON response
    // with a status code of `201 Created`
    (StatusCode::CREATED, Json(user))
}

// the input to our `create_user` handler
#[derive(Deserialize)]
struct CreateUser {
    username: String,
}

// the output to our `create_user` handler
#[derive(Serialize)]
struct User {
    id: u64,
    username: String,
}
