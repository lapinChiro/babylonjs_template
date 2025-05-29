#!/bin/sh

# エラーがあったらシェルスクリプトを終了する
set -e

atmp_command() {
    # （このスクリプト内での）グローバル変数の設定
    project_name=app_template
    command_name=atmp
    repository_root=$(
        cd "$(dirname "$0")/.."
        pwd
    )
    commands=$repository_root/cli/commands
    # DockerCompose を利用する場合は docker-compose.yml のパスを設定する。
    compose_file=$repository_root/development/docker-compose.yaml
    # compose_file=$repository_root/docker-compose.yml

    for i in "$repository_root"/cli/globals/*; do
        env_name=$(basename "$i")
        env_value=$(head -1 "$i")
        eval "$env_name"="$env_value"
    done

    # コマンドファイルを取得
    shell=$SHELL
    subcommand_name=$1
    [ $# -gt 0 ] && shift
    case "$subcommand_name" in
        # 標準で実装が期待されるコマンド
        welcome)
            subcommand_script=$commands/welcome.sh
            ;;
        initialize | init)
            subcommand_script=$commands/initialize.sh
            shell=$(get_shell)
            ;;
        cd)
            subcommand_script=$commands/cd.sh
            ;;
        edit)
            subcommand_script=$commands/edit.sh
            ;;
        prepare)
            subcommand_script=$commands/prepare.sh
            ;;
        self)
            subcommand_script=$commands/self.sh
            ;;

        # docker を利用するコマンドが最低限実装するべきコマンド
        process | ps)
            subcommand_script=$commands/process.sh
            ;;
        stop)
            subcommand_script=$commands/stop.sh
            ;;
        start)
            subcommand_script=$commands/start.sh
            ;;
        build)
            subcommand_script=$commands/build.sh
            ;;
        execute | exec)
            subcommand_script=$commands/execute.sh
            ;;
        shell)
            subcommand_script=$commands/shell.sh
            ;;
        restart)
            subcommand_script=$commands/restart.sh
            ;;
        log)
            subcommand_script=$commands/log.sh
            ;;
        url)
            subcommand_script=$commands/url.sh
            ;;

        # 独自の実装
        typespec)
            subcommand_script=$commands/typespec.sh
            ;;

        postgres)
            subcommand_script=$commands/postgres.sh
            ;;


        # Help
        help)
            usage && return
            ;;

        # 不正なコマンド
        *)
            usage && return 1
            ;;
    esac

    # コマンドの実行
    REPOSITORY_ROOT="$repository_root" \
        SHELL="$shell" \
        PROJECT_NAME="$project_name" \
        COMMAND_NAME="$command_name" \
        COMMANDS="$commands" \
        COMPOSE_FILE="$compose_file" \
        AWS_PROFILE="$project_name" \
        $subcommand_script "$@"
}

get_shell() {
    shell="$(ps -p "$PPID" -o 'args=' 2> /dev/null || true)"
    shell="${shell%% *}"
    shell="${shell##-}"
    shell="${shell:-$SHELL}"
    shell="${shell##*/}"
    shell="${shell%%-*}"
    echo "$shell"
}

usage() {
    cat <<- END 1>&2
UniqueVision でプロジェクト開発を便利にするためのCLIツールの雛形。

Commands:
    General:
        welcome                     初めて開発する人向けの情報。
        init[ialize] [OPTIONS]      初期化する。
        cd [DIRECTORY]              プロジェクト内のディレクトリに移動する。
        edit [FILE]...              エディタでプロジェクトを開く。
        prepare                     データベースの準備などをする。
        self                        ツール自身に対する操作を行う。
        help                        ヘルプを表示する。

    Containers:
        build                       ビルドする。
        start                       開始する。
        stop                        終了する。
        process|ps [--services]     起動しているDockerサービス一覧を表示する。
        exec[ute] SERVICE COMMAND   SERVICE_NAMEのコンテナで、COMMANDを実行する。
        shell SERVICE               対象のコンテナにシェルで入る。
        restart SERVICE             特定のサービスを再起動する。
        log [-f] [SERVICE]          ログを出力する。
        url SERVICE                 指定したサービスへアクセスするURLを出力する。
        typespec                    Typespecのコード生成
        postgres                    PostgreSQLに関するコマンドを実行する。

END
}

atmp_command "$@"
