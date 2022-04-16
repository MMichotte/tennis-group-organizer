#!/bin/bash

set -o allexport
source .env
set +o allexport

cd ..

#--------------------
#--------------------

# COLORS : 
RESET="\033[0m"
RED="\033[31m";     RED_BG="\033[41m"
GREEN="\033[32m";   GREEN_BG="\033[42m"; 
YELLOW="\033[33m";  YELLOW_BG="\033[43m"; 
BLUE="\033[34m";    BLUE_BG="\033[44m";  
MAGENTA="\033[35m"; MAGENTA_BG="\033[45m"; 
CYAN="\033[36m";    CYAN_BG="\033[46m"; 

#--------------------
#--------------------


SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

check_error () {
  if [ $? -eq 0 ]
  then
    echo -e $GREEN"\t$1"$RESET
  else
    echo -e $RED_BG"\nERROR$RESET$RED see error detail above.$RESET\n"
    rm -rf "$SCRIPTPATH/temp"
    exit 1
  fi
}
#--------------------
#--------------------
clear

echo -e "\n🚀 Starting Deployement procedure for$GREEN $TYPE : \n"$RESET 

echo -e $BLUE"1. 🗃  Creating temp app folder :"$RESET
rm -rf ./temp # remove temp folder if it already exists
mkdir ./temp && mkdir ./temp/app &&
mkdir ./temp/app/www && mkdir ./temp/app/www/public &&
check_error "✓ Temp folder successfully created."

#--------------------
echo -e $BLUE"\n2. 🏗  Building Backend :"$RESET
cp ./server.js ./temp/app/www &&
cp ./package.json ./temp/app/www &&
check_error "✓ Backend successfully built."

#--------------------
echo -e $BLUE"\n3. 🏗  Building Frontend :"$RESET
npm i --prodction --silent &&
npm run build --production --silent &&
mv ./build/* ./temp/app/www/public/ &&

check_error "✓ Frontend sucessfully built."

#--------------------
echo -e $BLUE"\n4. 🔑  Adding helper/config files :"$RESET
cp ./docker/docker-compose.yml ./temp/app/docker-compose.yml
check_error "✓ Helper & config files successfully added."

#--------------------
echo -e $BLUE"\n5. 🗂  Creating zip archive :"$RESET
cd ./temp/app &&
zip -qr ../app.zip ./. &&
cd ../..
check_error "✓ Zip archive successfully created."

#--------------------
echo -e $BLUE"\n6. 🚀 Sending to $TYPE server :"$RESET
scp -P $PORT ./temp/app.zip "$USER@$SERVER:$DST_DIR"
check_error "✓ Zip archive successfully sent to server."

#--------------------
echo -e $BLUE"\n7. 🛠  Unpacking Archive :"$RESET
ssh -p $PORT "$USER@$SERVER" "
  cd $DST_DIR && 
  unzip -oq app.zip && 
  rm -f app.zip
"
check_error "✓ Unpacking archive done."

#--------------------
echo -e $BLUE"\n8. 🎯 Restarting Services :"$RESET
ssh -p $PORT "$USER@$SERVER" "
  cd $DST_DIR &&
  docker-compose down &&
  docker-compose up -d
"
check_error "✓ Services restarted."

#--------------------
echo -e $BLUE"\n9. 🧼 Cleaning temp folder :"$RESET
rm -rf "$SCRIPTPATH/temp"

#--------------------
echo -e "✅  "$GREEN_BG"  DONE  $RESET : App successfully deployed in $TYPE on :"
echo -e $GREEN"\t$SERVER \n"$RESET

exit 0