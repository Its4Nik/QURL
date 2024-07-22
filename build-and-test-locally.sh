#!/usr/bin/env bash

clear 

name="${1:?Forgot the name?}"
port="${2:?Please set a port like this: 3000:80}"
tag="${3:-latest}"

image_name="${name}:${tag}"

echo "Image Name   : ${name}"
echo "Image Tag    : ${tag}"
echo "Port (host)  : $(echo "${port}" | cut -d ':' -f1)"
echo "Port (local) : $(echo "${port}" | cut -d ':' -f2)"
echo "Docker build : docker build -t \"${image_name}\" ."
echo "Docker run   : docker run --rm -p \"${port}\" \"${image_name}\""
echo

read -r -n 1 -p "Press any button to continue" 

echo "Build docker image: ${image_name}"

docker build -t "${image_name}" .

sleep 3

echo "Test the container: ${image_name}"

docker run --name "${name}" --rm -p "${port}" "${image_name}"

echo "Stopped and deleted container ${image_name}"

docker stop qurl