use std::sync::Arc;

use axum::{extract::State, response::IntoResponse};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::FromRow;
use tower_sessions::Session;
use uuid::Uuid;
use chrono::prelude::*;

use crate::{
    controllers::{get_session, make_response, ResponseType},
    error::ApiError, AppState,
};

pub async fn execute(State(state): State<Arc<AppState>>, session: Session) -> impl IntoResponse {
    make_response(inner(session, &state.pg_pool).await)
}

async fn inner(session: Session, pg_pool: &sqlx::PgPool) -> Result<ResponseType, ApiError> {
    let user = get_session(&pg_pool, &session).await?;
    let list = execute_db(&pg_pool, user.user_uuid).await?;
    Ok(ResponseType::new_list(
        "success",
        list.into_iter()
            .map(|item| json!({
                "uuid": item.uuid,
                "title": item.title,
                "content": item.content,
                "created_utsms": item.created_at.timestamp_millis(),
                "updated_utsms": item.updated_at.timestamp_millis(),
            }))
            .collect::<Vec<_>>(),
    ))
}

const SQL: &str = r#"
SELECT
    t1.uuid
    ,t1.title
    ,t1.content
    ,t1.created_at
    ,t1.updated_at
FROM
    generated_get_list_memos(
        p_user_uuid := $1
    ) AS t1
"#;

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq, Eq, FromRow)]
pub struct DbOutput {
    pub uuid: Uuid,
    pub title: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

async fn execute_db(pg_pool: &sqlx::PgPool, user_uuid: Uuid) -> Result<Vec<DbOutput>, sqlx::Error> {
    let res: Vec<DbOutput> = sqlx::query_as(SQL)
        .bind(user_uuid)
        .fetch_all(pg_pool)
        .await?;
    Ok(res)
}