#!/bin/sh

set -e

welcome() {
    viewer=${UV_VIEWER:-less}
    $viewer "$REPOSITORY_ROOT/cli/README.md"
}

welcome "$@"
