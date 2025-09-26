#!/bin/sh

set -e

_bash() {
    command=$1
    [ $# -gt 0 ] && shift
    case "$command" in
        variables) variables ;;
        complete) _complete ;;
    esac
}

variables() {
    :
}

_complete() {
    "$COMMANDS/initialize/_shell/_complete.sh" bash
}

_bash "$@"
