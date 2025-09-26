#!/bin/sh

set -e

_cd() {
    if [ "$UV_CURRENT_SHELL_PID" = "" ]; then
        echo "uvコマンドを利用していなければ使えません。" 1>&2
        return 1
    fi

    echo "cd $REPOSITORY_ROOT/$1" > "$HOME"/.uv_trap_command \
        && kill -USR1 "$UV_CURRENT_SHELL_PID"
}

_cd "$@"
