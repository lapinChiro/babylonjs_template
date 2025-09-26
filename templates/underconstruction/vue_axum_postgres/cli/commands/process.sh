#!/bin/sh

set -e

process() {
    "$COMMANDS/_docker/_compose.sh" --file "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps "$@"

}

process "$@"
