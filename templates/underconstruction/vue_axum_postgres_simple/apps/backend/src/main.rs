use axum::{
    Extension, Json, Router,
    http::{StatusCode, Method},
    routing::{get, post},
};
use common::config::Config;
use postgresql::prelude::*;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tower_http::cors::{AllowHeaders, CorsLayer, Any};
use uuid::Uuid;
use chrono::Utc;

pub mod error;

#[tokio::main]
async fn main() {
    println!("🚀 Starting API server...");

    let config = Config::setup();
    let pg_pool = config.pg_pool().await.unwrap();
    println!("✅ Database connection established");

    // CORS
    let cors_layer = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(AllowHeaders::any());

    // build our application with a route
    let app = Router::new()
        // User endpoints
        .route("/api/users", get(list_users))
        .route("/api/users", post(create_user))
        .layer(Extension(pg_pool))
        .layer(cors_layer);

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("🌐 Server listening on http://0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}

// Response struct for API (simplified view of Users)
#[derive(Serialize)]
struct UserResponse {
    uuid: Uuid,
    user_code: String,
    name: String,
    mail: String,
    last_login_at: Option<chrono::DateTime<chrono::Utc>>,
    created_at: chrono::DateTime<chrono::Utc>,
}

impl From<Users> for UserResponse {
    fn from(user: Users) -> Self {
        UserResponse {
            uuid: user.uuid,
            user_code: user.user_code,
            name: user.name,
            mail: user.mail,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
        }
    }
}

async fn list_users(
    Extension(pg_pool): Extension<PgPool>,
) -> Result<Json<Vec<UserResponse>>, StatusCode> {
    // Use the generated Users::select_all function
    let users = Users::select_all(&pg_pool)
        .await
        .map_err(|err| {
            eprintln!("Database error in list_users (hot reload test): {:?}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // Convert to response format
    let user_responses: Vec<UserResponse> = users.into_iter().map(UserResponse::from).collect();

    Ok(Json(user_responses))
}

async fn create_user(
    Extension(pg_pool): Extension<PgPool>,
    Json(payload): Json<CreateUser>,
) -> Result<(StatusCode, Json<UserResponse>), StatusCode> {
    let now = Utc::now();

    // Create a new user using the generated Users struct
    let new_user = UsersBuilder::default()
        .uuid(Uuid::new_v4())
        .user_code(payload.username.clone())
        .name(payload.username)
        .mail(payload.email.unwrap_or_else(|| "".to_string()))
        .created_at(now)
        .updated_at(now)
        .created_pg("api".to_string())
        .updated_pg("api".to_string())
        .deleted_pg("".to_string())
        .build()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Insert the user using the generated insert method
    let created_user = new_user.insert(&pg_pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::CREATED, Json(UserResponse::from(created_user))))
}

// the input to our `create_user` handler
#[derive(Deserialize)]
struct CreateUser {
    username: String,
    email: Option<String>,
}