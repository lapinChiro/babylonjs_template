#!/bin/sh

set -e

restart() {
    "$COMMANDS/_docker/_check_service.sh" "$@"

    "$COMMANDS/_docker/_compose.sh" --file "$COMPOSE_FILE" --project-name "$PROJECT_NAME" restart "$@"
}

restart "$@"
