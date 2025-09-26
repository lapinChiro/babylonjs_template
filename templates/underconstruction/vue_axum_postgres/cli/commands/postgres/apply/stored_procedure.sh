#!/bin/sh

stored_procedure() {
    local tmpfile=$(mktemp)
    touch $tmpfile
    cat $REPOSITORY_ROOT/db/sql/lib/*.sql >> $tmpfile
    cat $REPOSITORY_ROOT/db/sql/stored/*.sql >> $tmpfile
    cat $REPOSITORY_ROOT/db/sql/stored/*/*.sql >> $tmpfile

    $COMMAND_NAME postgres shell -f $tmpfile -t
    rm $tmpfile
}

stored_procedure
