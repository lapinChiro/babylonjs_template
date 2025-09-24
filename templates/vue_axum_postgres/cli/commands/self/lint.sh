#!/bin/sh

set -e

_lint() {
    if [ ! -x "$(command -v shellcheck)" ]; then
        echo "このコマンドを使用するには shellcheck コマンドが必用です。次のコマンドなどでインストールしてください。" 1>&2
        echo "  sudo apt-get install -y shellcheck" 1>&2

        return 1
    fi

    cd "$REPOSITORY_ROOT/cli"

    sh_files=$(mktemp)
    find . ! -name "$(printf "*\n*")" -name '*.sh' > "$sh_files"
    while IFS= read -r file; do
        echo "cli/$(echo "$file" | cut -c 3-)"
        shellcheck "$file" || status=$?
    done < "$sh_files"
    rm "$sh_files"

    if [ -z "$status" ]; then
        return 0
    else
        return "$status"
    fi
}

_lint "$@"
