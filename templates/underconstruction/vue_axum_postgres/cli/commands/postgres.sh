#!/bin/sh

postgres() {
    local subcommand=$1; [ $# -gt 0 ] && shift
    case $subcommand in
        "prepare"       ) $COMMANDS/postgres/prepare.sh ;;
        "shell"         ) $COMMANDS/postgres/shell.sh "$@" ;;
        "watch"         ) $COMMANDS/postgres/watch.sh "$@" ;;
        *               ) usage ;;
    esac
}

usage() {
    echo 'Commands:' 1>&2
    echo '  postgres prepare                            PostgreSQLに対して初期化・初期データ投入を行う' 1>&2
    echo '  postgres shell [OPTIONS]                    PostgreSQLのシェルを起動する' 1>&2
    echo '  postgres watch                              db/sql/stored以下の変更を自動で適用' 1>&2
}

postgres "$@"
