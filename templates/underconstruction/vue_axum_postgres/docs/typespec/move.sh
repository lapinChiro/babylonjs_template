#/bin/bash

function copy_move() {
    if [ ! -d $2 ]; then
        mkdir $2
    else
        rm -rf $2
        mkdir $2
    fi
    cp -r $1/* $2
}

rm -rf ./tsp-output/clients

tsp compile .

SRCDIR=./tsp-output/clients/js/src/api
DSTDIR=../../apps/frontend/src/api
copy_move $SRCDIR $DSTDIR

SRCDIR=./tsp-output/clients/js/src/helpers
DSTDIR=../../apps/frontend/src/helpers
copy_move $SRCDIR $DSTDIR

SRCDIR=./tsp-output/clients/js/src/models
DSTDIR=../../apps/frontend/src/models
copy_move $SRCDIR $DSTDIR

cp ./tsp-output/clients/js/src/templateServiceClient.ts ../../apps/frontend/src/templateServiceClient.ts