#!/bin/sh

set -e

_format() {
    if [ ! -x "$(command -v shfmt)" ]; then
        echo "このコマンドを使用するには shfmt コマンドが必用です。次のコマンドを試してください。" 1>&2
        echo "  curl -sS https://webinstall.dev/shfmt | bash" 1>&2
        return 1
    fi

    if [ "$1" = "--dry-run" ]; then
        option="-d"
    else
        option="-w"
    fi

    cd "$REPOSITORY_ROOT/cli"

    sh_files=$(mktemp)
    find . ! -name "$(printf "*\n*")" -name '*.sh' > "$sh_files"
    while IFS= read -r file; do
        echo "cli/$(echo "$file" | cut -c 3-)"
        shfmt "$option" "$file" || status=$?
    done < "$sh_files"
    rm "$sh_files"

    if [ -z "$status" ]; then
        return 0
    else
        return "$status"
    fi
}

_format "$@"
