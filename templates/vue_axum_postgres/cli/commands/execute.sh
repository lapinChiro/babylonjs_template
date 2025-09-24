#!/bin/sh

set -e

execute() {
    service=$1
    [ $# -gt 0 ] && shift

    "$COMMANDS/_docker/_check_service.sh" "$service"

    [ "$*" = "" ] && echo "実行するコマンドを指定してください。" 1>&2 && return 1

    "$COMMANDS/_docker/_compose.sh" --file "$COMPOSE_FILE" --project-name "$PROJECT_NAME" exec "$service" "$@"
}

execute "$@"
