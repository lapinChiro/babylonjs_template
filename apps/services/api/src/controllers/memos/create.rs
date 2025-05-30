use std::sync::Arc;

use axum::{Json, extract::State, response::IntoResponse};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    controllers::{get_session, make_response, ResponseType}, error::ApiError, AppState
};

pub async fn execute(
    State(state): State<Arc<AppState>>,
    session: Session,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    make_response(inner(payload, session, &state.pg_pool).await)
}

async fn inner(
    payload: serde_json::Value,
    session: Session,
    pg_pool: &sqlx::PgPool,
) -> Result<ResponseType, ApiError> {
    let user = get_session(&pg_pool, &session).await?;

    let uuid = payload
        .get("uuid")
        .and_then(|v| v.as_str());

    let title = payload
        .get("title")
        .and_then(|v| v.as_str())
        .ok_or_else(|| ApiError::Invalid("Title not found".to_string()))?;

    let content = payload
        .get("content")
        .and_then(|v| v.as_str())
        .ok_or_else(|| ApiError::Invalid("Content not found".to_string()))?;
    
    execute_db(&pg_pool, uuid, title, content, user.user_uuid).await?;

    Ok(ResponseType::new_no_data("success"))
}

const SQL: &str = r#"
SELECT
    t1.uuid
FROM
    generated_set_add_memos(
        p_uuid := $1
        , p_title := $2
        , p_content := $3
        , p_user_uuid := $4
    ) AS t1
"#;

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq, Eq, FromRow)]
pub struct DbOutput {
    pub uuid: Uuid,
}

async fn execute_db(pg_pool: &sqlx::PgPool, uuid: Option<&str>, title: &str, content: &str, user_uuid: Uuid) -> Result<DbOutput, sqlx::Error> {
    let res: DbOutput = sqlx::query_as(SQL)
        .bind(uuid)
        .bind(title)
        .bind(content)
        .bind(user_uuid)
        .fetch_one(pg_pool)
        .await?;
    Ok(res)
}