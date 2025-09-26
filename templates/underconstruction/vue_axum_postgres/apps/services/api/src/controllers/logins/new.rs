use std::sync::Arc;

use axum::{extract::State, response::IntoResponse};
use google_login::Oauth2Client;
use serde_json::json;
use tower_sessions::Session;

use crate::{
    AppState,
    controllers::{ResponseType, SESSION_PKCE_VERIFIER, make_response},
    error::ApiError,
};

pub async fn execute(session: Session, State(state): State<Arc<AppState>>) -> impl IntoResponse {
    make_response(inner(&state.oauth2_client, session).await)
}

async fn inner(oauth2_client: &Oauth2Client, session: Session) -> Result<ResponseType, ApiError> {
    let result = oauth2_client.oauth_url(None);
    session
        .insert(SESSION_PKCE_VERIFIER, result.pkce_verifier)
        .await?;
    Ok(ResponseType::new_data(
        "success",
        json!({
            "url": result.oauth_url,
        }),
    ))
}
