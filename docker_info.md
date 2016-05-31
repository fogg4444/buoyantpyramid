### --- Using Docker ---

install with these instructions:
  https://docs.docker.com/engine/installation/mac/

start docker CLI
  bash --login '/Applications/Docker/Docker Quickstart Terminal.app/Contents/Resources/Scripts/start.sh'

display images
  docker images
  docker images -a

list running containers
  docker ps

show latest created container
  docker ps -l

--- helpful commands ---
Delete all containers
  docker rm $(docker ps -a -q)

Delete all images
  docker rmi $(docker images -q)

build image
  docker build -t brian/testapp .

run container
  docker run
    -p - port settings 
    49160:8080
    -d 
    test_app

docker run -p 3000:3000 -d brian/testapp

POSTGRES

pull it down
  docker pull postgres

start it
  docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres

connect to it from an app
  docker run --link some-postgres:postgres -d brian/testapp

##########################

--------------- Docker Environment Setup ---------------
Docker Quickstart

docker-compose up

Wait for the long download!

visit: 192.168.99.100