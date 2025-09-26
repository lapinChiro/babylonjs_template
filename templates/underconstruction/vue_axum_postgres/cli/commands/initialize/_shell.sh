#!/bin/sh

set -e

initialize_shell() {
    shell="${1:-$SHELL}"
    case "$shell" in
        bsh | bash)
            execute_tasks _bash.sh
            ;;
        csh)
            execute_tasks _csh.sh
            ;;
        zsh)
            execute_tasks _zsh.sh
            ;;
        fish)
            execute_tasks _fish.sh
            ;;
        *)
            echo "\"$shell\" はサポートしていないShellです。" 1>&2 && return 1
            ;;
    esac
}

execute_tasks() {
    script_name="$1"
    "$COMMANDS/initialize/_shell/$script_name" variables
    "$COMMANDS/initialize/_shell/$script_name" complete
}

initialize_shell "$@"
