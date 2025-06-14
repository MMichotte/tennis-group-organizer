#! /bin/bash

img_name="tennis-organizer-app"
tag="latest"
dockerhub_username="mmichotte"

dockerhub_img=$dockerhub_username/$img_name:$tag

docker build -t $img_name . &&
  docker tag $img_name $dockerhub_img &&
  docker login &&
  docker push $dockerhub_img

docker system prune -af