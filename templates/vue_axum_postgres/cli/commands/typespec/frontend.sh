#!/bin/bash

frontend() {
    cd $REPOSITORY_ROOT/docs/typespec
    ./move.sh
}

frontend