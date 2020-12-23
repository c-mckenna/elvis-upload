# Alternative Deployment

## Overview

This document describes steps and resources required to deploy a new instance of placenames/upload application/web site hosted on AWS/EC2.

## Prerequisites

This deployment requires a preinstalled and configured instance of `placenames` application/web site on the same instance. See [this](https://github.com/GeoscienceAustralia/elvis-placenames/blob/master/documentation/alt_deployment.md) for the deployment of `placenames`.

## Steps

1. Add the

        export ESRI_USERNAME=xxxxx
        export ESRI_PASSWORD=xxxxx
        export PLACENAMES_AWS_S3_BUCKET=xxxxx
        export PLACENAMES_AWS_COGNITO_LOGIN_URL=xxxxx
        export PLACENAMES_AWS_COGNITO_JWKS_URL=xxxxx
    environmental variables to the `.bash_profile` file.

2. Run the `source .bash_profile` command.

3. Copy the `elvis-upload/code-deploy/alt_deploy` script to the instance.

4. Run the script once, e.g. `/bin/bash alt_deploy`
