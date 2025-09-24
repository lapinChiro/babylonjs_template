#!/bin/sh

set -e

shell() {
    "$COMMANDS/execute.sh" "$1" bash
}

shell "$@"
