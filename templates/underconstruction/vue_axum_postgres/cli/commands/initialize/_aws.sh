#!/bin/sh

set -e

initialize_aws() {
    ! use_aws && return

    region=ap-northeast-1
    access_key_id=$(get_access_key_id)
    secret_access_key=$(get_secret_access_key)

    [ "$(aws configure --profile "$AWS_PROFILE" list 2>&1 | grep "could not be found")" = "" ] && return

    AWS_REGION=$region \
        AWS_ACCESS_KEY_ID=$access_key_id \
        AWS_SECRET_ACCESS_KEY=$secret_access_key \
        add_profile
}

use_aws() {
    if [ -x "$(command -v uv)" ]; then
        uv known variable "$PROJECT_NAME" | grep -q ^AWS_ACCESS_KEY_ID$ \
            && uv known variable "$PROJECT_NAME" | grep -q ^AWS_SECRET_ACCESS_KEY$
    else
        [ "$AWS_ACCESS_KEY_ID" != "" ] && [ "$AWS_SECRET_ACCESS_KEY" != "" ]
    fi
}

get_access_key_id() {
    if [ -x "$(command -v uv)" ]; then
        uv known variable "$PROJECT_NAME" AWS_ACCESS_KEY_ID
    else
        echo "$AWS_ACCESS_KEY_ID"
    fi
}

get_secret_access_key() {
    if [ -x "$(command -v uv)" ]; then
        uv known variable "$PROJECT_NAME" AWS_SECRET_ACCESS_KEY
    else
        echo "$AWS_SECRET_ACCESS_KEY"
    fi
}

add_profile() {
    add_profile_to_config
    add_profile_to_credentials
}

add_profile_to_config() {
    cat << END >> ~/.aws/config

[profile $AWS_PROFILE]
region = $AWS_REGION
output = json
END
}

add_profile_to_credentials() {
    cat << END >> ~/.aws/credentials

[$AWS_PROFILE]
aws_access_key_id = $AWS_ACCESS_KEY_ID
aws_secret_access_key = $AWS_SECRET_ACCESS_KEY
END
}

initialize_aws "$@"
