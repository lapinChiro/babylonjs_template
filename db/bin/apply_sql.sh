#!/bin/sh
SCRIPT_DIR=$(cd $(dirname $0); pwd)
SQL_DIR=$SCRIPT_DIR/../sql

cat $SQL_DIR/01_prepare.sql > ./all.sql
cat $SQL_DIR/lib/*.sql >> ./all.sql
cat $SQL_DIR/table/*.sql >> ./all.sql
cat $SQL_DIR/stored/gererated/*.sql >> ./all.sql
cat $SQL_DIR/stored/*.sql >> ./all.sql
if [ -f $SQL_DIR/99_secret.sql ]; then
cat $SQL_DIR/99_secret.sql >> ./all.sql
fi

PGPASSWORD=${PGPASS-pass} psql --set "ON_ERROR_STOP=1" -p ${PGPORT:-5433} -h ${PGHOST:-localhost} -U ${PGUSER:-user} ${PGDATABASE:-web} -f ./all.sql

rm ./all.sql
