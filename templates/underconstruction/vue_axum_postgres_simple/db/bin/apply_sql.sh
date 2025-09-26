#!/bin/bash
set -e

# When run during container initialization, use /db as the base path
if [ -d "/db" ]; then
    SQL_DIR="/db/sql"
else
    # Fallback for manual execution
    SCRIPT_DIR=$(cd $(dirname $0); pwd)
    SQL_DIR=$SCRIPT_DIR/../sql
fi

TEMP_FILE=/tmp/all.sql

# Check if files exist before concatenating
if [ -f "$SQL_DIR/01_prepare.sql" ]; then
    cat "$SQL_DIR/01_prepare.sql" > $TEMP_FILE
else
    echo "-- No prepare file found" > $TEMP_FILE
fi

if ls "$SQL_DIR/lib/"*.sql 1> /dev/null 2>&1; then
    cat "$SQL_DIR/lib/"*.sql >> $TEMP_FILE
fi

if ls "$SQL_DIR/table/generated/"*.sql 1> /dev/null 2>&1; then
    cat "$SQL_DIR/table/generated/"*.sql >> $TEMP_FILE
fi

if [ -f "$SQL_DIR/99_secret.sql" ]; then
    cat "$SQL_DIR/99_secret.sql" >> $TEMP_FILE
fi

# During container initialization, use direct psql without host/port
if [ -n "$POSTGRES_DB" ]; then
    # Running during container initialization - use direct psql
    psql --set "ON_ERROR_STOP=1" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f $TEMP_FILE
else
    # Running after container is up - use network connection
    PGPASSWORD=${PGPASSWORD:-pass} psql --set "ON_ERROR_STOP=1" -p ${PGPORT:-5432} -h ${PGHOST:-localhost} -U ${PGUSER:-user} ${PGDATABASE:-web} -f $TEMP_FILE
fi

rm $TEMP_FILE
