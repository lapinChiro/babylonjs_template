#!/bin/sh

set -e

stop() {
    "$COMMANDS/_docker/_compose.sh" --file "$COMPOSE_FILE" --project-name "$PROJECT_NAME" down "$@"
}

stop "$@"
