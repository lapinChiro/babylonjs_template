use std::time::Duration;

use error::GoogleLoginError;
use oauth2::{
    AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, RedirectUrl, Scope,
    TokenResponse, TokenUrl, basic::BasicClient, reqwest,
};
use serde::{Deserialize, Serialize};

pub mod error;

pub struct Oauth2Client {
    client_id: ClientId,
    client_secret: ClientSecret,
    auth_url: AuthUrl,
    token_url: TokenUrl,
    redirect_url: RedirectUrl,
    scopes: Vec<Scope>,
}

#[derive(Debug, Clone)]
pub struct OAuth2UrlResult {
    pub oauth_url: String,
    pub pkce_verifier: String,
}

#[derive(Debug, Clone)]
pub struct TokenResult {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_in: Option<Duration>,
}

impl Oauth2Client {
    pub fn new(client_id: &str, client_secret: &str, redirect_uri: &str) -> Self {
        let client_id = ClientId::new(client_id.to_owned());
        let client_secret = ClientSecret::new(client_secret.to_owned());
        let auth_url =
            AuthUrl::new("https://accounts.google.com/o/oauth2/auth".to_string()).unwrap();
        let token_url = TokenUrl::new("https://oauth2.googleapis.com/token".to_string()).unwrap();
        let redirect_url = RedirectUrl::new(redirect_uri.to_owned()).unwrap();
        let scopes = vec![
            Scope::new("https://www.googleapis.com/auth/userinfo.email".to_string()),
            Scope::new("https://www.googleapis.com/auth/userinfo.profile".to_string()),
        ];
        Oauth2Client {
            client_id,
            client_secret,
            auth_url,
            token_url,
            redirect_url,
            scopes,
        }
    }

    pub fn oauth_url(&self, state: Option<String>) -> OAuth2UrlResult {
        let (pkce_challenge, pkce_verifier) = oauth2::PkceCodeChallenge::new_random_sha256();
        let csrf_token = match state {
            Some(ref state_value) => CsrfToken::new(state_value.clone()),
            None => CsrfToken::new_random(),
        };

        let client = BasicClient::new(self.client_id.clone())
            .set_client_secret(self.client_secret.clone())
            .set_auth_uri(self.auth_url.clone())
            .set_token_uri(self.token_url.clone());

        let (auth_url, _csrf_token) = client
            .clone()
            .set_redirect_uri(self.redirect_url.clone())
            .authorize_url(|| csrf_token)
            .add_scopes(self.scopes.clone())
            .set_pkce_challenge(pkce_challenge)
            .url();

        OAuth2UrlResult {
            oauth_url: auth_url.to_string(),
            pkce_verifier: pkce_verifier.secret().to_string(),
        }
    }

    pub async fn token(
        &self,
        pkce_verifier_str: &str,
        code: &str,
        timeout: Duration,
    ) -> Result<TokenResult, GoogleLoginError> {
        let pkce_verifier = oauth2::PkceCodeVerifier::new(pkce_verifier_str.to_owned());

        let client = BasicClient::new(self.client_id.clone())
            .set_client_secret(self.client_secret.clone())
            .set_auth_uri(self.auth_url.clone())
            .set_token_uri(self.token_url.clone());

        let http_client = reqwest::ClientBuilder::new()
            .redirect(reqwest::redirect::Policy::none())
            .timeout(timeout)
            .build()?;

        let token = client
            .clone()
            .set_redirect_uri(self.redirect_url.clone())
            .exchange_code(AuthorizationCode::new(code.to_owned()))
            .set_pkce_verifier(pkce_verifier)
            .request_async(&http_client)
            .await
            .map_err(|e| GoogleLoginError::Token(format!("{:?}", e)))?;
        Ok(TokenResult {
            access_token: token.access_token().secret().to_string(),
            refresh_token: token.refresh_token().map(|it| it.secret().to_string()),
            expires_in: token.expires_in(),
        })
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserInfo {
    pub email: String,
    pub id: String,
    pub name: Option<String>,
    pub family_name: Option<String>,
    pub given_name: Option<String>,
    pub hd: Option<String>,
    pub locale: Option<String>,
    pub picture: Option<String>,
    pub verified_email: Option<bool>,
}

const USER_INFO_URL: &str = "https://www.googleapis.com/oauth2/v1/userinfo";
pub async fn request_user_info(
    token: &str,
    timeout: Duration,
) -> Result<UserInfo, GoogleLoginError> {
    let client = reqwest::ClientBuilder::new().timeout(timeout).build()?;
    let builder = client.get(USER_INFO_URL).bearer_auth(token);
    let response = builder.send().await?;
    let body = response.text().await?;
    Ok(serde_json::from_str(&body)?)
}
