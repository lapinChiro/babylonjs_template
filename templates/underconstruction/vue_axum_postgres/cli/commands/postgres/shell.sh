#!/bin/sh

_shell() {
    local subcommand=$1; [ $# -gt 0 ] && shift
    case $subcommand in
        ""          ) shell "$@" ;;
        *               ) shell "$subcommand" "$@" ;;
    esac
}

shell() {
    PGUSER=user \
    PGHOST=localhost \
    PGPORT=5435 \
    PGDATABASE=web \
    PGPASSWORD=pass \
    PAGER=${PAGER:-cat} \
    psql "$@"
}

_shell "$@"
