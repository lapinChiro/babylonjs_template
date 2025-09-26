#!/bin/sh

set -e

_csh() {
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
    :
}

_csh "$@"
