#!/bin/sh

# サービス名が見つからない場合エラーになるが無視したい
# set -e

check_service() {
    if [ "$1" = "" ]; then
        echo "サービス名が指定されていません。" 1>&2
        service_hint
        return 1
    fi

    service=$("$COMMANDS/process.sh" --services | grep ^"$1"$)

    if [ "$service" = "" ]; then
        echo "サービス名が間違っています。" 1>&2
        service_hint
        return 1
    fi
}

service_hint() {
    cat <<- END 1>&2
以下のサービスから指定して下さい。
$("$COMMANDS/process.sh" --services)

END
}

check_service "$@"
