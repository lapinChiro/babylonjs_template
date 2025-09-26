#!/bin/sh

set -e

_complete() {
    shell_type="$1"
    config_file="cli/completion/${COMMAND_NAME}_cmdcomp.toml"
    output_file="cli/completion/${shell_type}"

    echo "source $REPOSITORY_ROOT/$output_file"

    [ -e "$REPOSITORY_ROOT/$output_file" ] \
        && [ -n "$(find "$REPOSITORY_ROOT/$output_file" -newer "$REPOSITORY_ROOT/$config_file")" ] && return

    docker run --rm -itv "$REPOSITORY_ROOT:/apps/cmdcomp" uvdockerhub/cmdcomp \
        --file "$config_file" \
        --shell-type "$shell_type" \
        --output-file "$output_file"
}

_complete "$@"
