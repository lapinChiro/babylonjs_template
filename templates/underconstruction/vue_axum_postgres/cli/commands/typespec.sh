#!/bin/sh

typespec() {
    local subcommand=$1; [ $# -gt 0 ] && shift
    case $subcommand in
        "frontend"      ) $COMMANDS/typespec/frontend.sh ;;
        *               ) usage ;;
    esac
}

usage() {
    echo 'Commands:' 1>&2
    echo '  typespec frontend                            Typespecのフロントエンドコード生成' 1>&2
}

typespec "$@"
