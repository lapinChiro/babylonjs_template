#!/bin/sh

set -e

compose() {
    if docker compose version 1> /dev/null 2>&1; then
        # v2
        docker compose "$@"
    else
        # v1
        docker-compose "$@"
    fi
}

service_hint() {
    cat <<- END 1>&2
以下のサービスから指定して下さい。
$("$COMMANDS/process.sh" --services)

END
}

compose "$@"
