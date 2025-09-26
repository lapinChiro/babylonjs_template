#!/bin/sh

set -e

start() {
    "$COMMANDS/_docker/_compose.sh" --file "$COMPOSE_FILE" --project-name "$PROJECT_NAME" up -d "$@"
}

start "$@"
