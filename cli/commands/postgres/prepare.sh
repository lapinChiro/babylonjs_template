#!/bin/sh

prepare() {
    $REPOSITORY_ROOT/db/bin/apply_sql.sh
}

prepare
