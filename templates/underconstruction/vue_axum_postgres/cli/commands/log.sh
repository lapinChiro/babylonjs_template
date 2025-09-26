#!/bin/sh

set -e

log() {
    "$COMMANDS/_docker/_compose.sh" --file "$COMPOSE_FILE" --project-name "$PROJECT_NAME" logs "$@"
}

log "$@"
