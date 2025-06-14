#! /bin/bash

platform=linux/amd64
img_name="tennis-organizer-app"
tag="latest"
dockerhub_username="mmichotte"

dockerhub_img=$dockerhub_username/$img_name:$tag

docker build --platform $platform -t $img_name . &&
  docker tag $img_name $dockerhub_img &&
  docker login &&
  docker push $dockerhub_img

docker system prune -af