use std::sync::Arc;

use axum::{extract::{Path, State}, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    controllers::{get_session, make_response, ResponseType}, error::ApiError, AppState
};

pub async fn execute(
    Path(memo_uuid): Path<Uuid>, 
    State(state): State<Arc<AppState>>,
    session: Session,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    make_response(inner(payload, session, &state.pg_pool, memo_uuid).await)
}

async fn inner(
    payload: serde_json::Value,
    session: Session,
    pg_pool: &sqlx::PgPool,
    memo_uuid: Uuid,
) -> Result<ResponseType, ApiError> {
    let user = get_session(&pg_pool, &session).await?;

    let title = payload
        .get("title")
        .and_then(|v| v.as_str())
        .ok_or_else(|| ApiError::Invalid("Title not found".to_string()))?;

    let content = payload
        .get("content")
        .and_then(|v| v.as_str())
        .ok_or_else(|| ApiError::Invalid("Content not found".to_string()))?;
    
    execute_db(&pg_pool, title, content, user.user_uuid, memo_uuid).await?;

    Ok(ResponseType::new_no_data("success"))
}

const SQL: &str = r#"
SELECT
    t1.uuid
FROM
    generated_set_add_memos(
        p_title := $1
        , p_content := $2
        , p_user_uuid := $3
        , p_uuid := $4
    ) AS t1
"#;

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq, Eq, FromRow)]
pub struct DbOutput {
    pub uuid: Uuid,
}

async fn execute_db(pg_pool: &sqlx::PgPool, title: &str, content: &str, user_uuid: Uuid, memo_uuid: Uuid) -> Result<DbOutput, sqlx::Error> {
    let res: DbOutput = sqlx::query_as(SQL)
        .bind(title)
        .bind(content)
        .bind(user_uuid)
        .bind(memo_uuid)
        .fetch_one(pg_pool)
        .await?;
    Ok(res)
}