#!/bin/sh

set -e

prepare() {
    echo "データベースに入れるデータなどが、まだ設定されていません。" 1>&2
}

prepare "$@"
