#!/bin/sh

set -e

_build() {
    "$COMMANDS/_docker/_compose.sh" --file "$COMPOSE_FILE" --project-name "$PROJECT_NAME" build "$@"
}

_build "$@"
