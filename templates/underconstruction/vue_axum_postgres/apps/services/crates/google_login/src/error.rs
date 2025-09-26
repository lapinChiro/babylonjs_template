use thiserror::Error;

#[derive(Error, Debug)]
pub enum GoogleLoginError {
    #[error("Url {0}")]
    Url(#[from] oauth2::url::ParseError),

    #[error("Reqwest {0}")]
    Reqwest(#[from] oauth2::reqwest::Error),

    #[error("Json {0}")]
    Json(#[from] serde_json::Error),

    #[error("Token {0}")]
    Token(String),
}
