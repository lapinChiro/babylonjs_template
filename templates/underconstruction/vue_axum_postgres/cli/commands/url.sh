#!/bin/sh

set -e

_url() {
    "$COMMANDS/_docker/_check_service.sh" "$@"

    url=$(
        "$COMMANDS/process.sh" \
            | grep -E "^${PROJECT_NAME}[_-]$1[_-][0-9]+ " \
            | sed -E 's/^.*(:[0-9]+).*$/http:\/\/localhost\1/'
    )

    [ "$url" = "" ] && echo "URLが生成できませんでした。" 1>&2 && return 1

    echo "$url"
}

_url "$@"
