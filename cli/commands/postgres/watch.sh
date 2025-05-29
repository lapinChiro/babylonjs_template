#!/bin/sh

watch() {
    if ! command -v entr > /dev/null; then
        echo "entr がインストールされていません。インストールしてください"
        return 1
    fi
    find $REPOSITORY_ROOT/db/sql/ -name '*.sql' | entr "$REPOSITORY_ROOT/db/bin/apply_sql.sh"
}

watch
