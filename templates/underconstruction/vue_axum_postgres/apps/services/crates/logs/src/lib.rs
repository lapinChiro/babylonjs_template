use tracing::Level;
use tracing_bunyan_formatter::{BunyanFormattingLayer, JsonStorageLayer};
use tracing_subscriber::filter::Targets;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::Registry;

pub use tracing;

pub fn setup_tracing(name: &str) {
    std::env::set_var("RUST_LOG", format!("warn,{}=debug,tower_http=trace", name));

    let formatting_layer = BunyanFormattingLayer::new(name.into(), std::io::stdout);
    let filter = Targets::new()
        .with_target(name, Level::INFO)
        .with_target("controllers", Level::INFO)
        .with_target("looper", Level::INFO)
        .with_target("stream_utils", Level::INFO)
        .with_target("rule", Level::INFO)
        .with_target("tower_http", Level::TRACE)
        .with_target("otel::tracing", Level::TRACE);

    let subscriber = Registry::default()
        .with(filter)
        .with(JsonStorageLayer)
        .with(formatting_layer);
    tracing::subscriber::set_global_default(subscriber).unwrap();
}
