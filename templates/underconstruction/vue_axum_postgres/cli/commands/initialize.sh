#!/bin/sh

set -e

initialize() {
    is_print_mode=false

    # 引数がない場合、初期化を行う
    if [ $# = 0 ]; then
        "$COMMANDS/initialize/_aws.sh"
        return
    fi

    # オプションをチェックし取り除く
    for arg in "$@"; do
        case "$arg" in
            -)
                shift && is_print_mode=true
                ;;
            --path)
                echo "Pathモードは存在しません。" 1>&2 && return 1
                ;;
            aws)
                exec "$COMMANDS/initialize/_aws.sh" && return
                ;;
        esac
    done

    if "$is_print_mode"; then
        # シェル毎のパス設定
        exec "$COMMANDS/initialize/_shell.sh" "$@"
    else
        usage && return 1
    fi
}

usage() {
    cat <<- END 1>&2
Commands:
    initialize                       必要なツールを準備する。
    initialize - [bash|zsh|csh|fish] シェルの設定を出力する。
    initialize aws                   AWSのプロファイルを設定する。

END
}

initialize "$@"
