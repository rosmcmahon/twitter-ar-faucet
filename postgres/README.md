### Tear down

`docker-compose down --remove-orphans`
`sudo rm -r /mnt/<custom-dir>`

### Set up

`docker-compose up --build`

### Manual testing

`docker container ps`

`docker exec -it XXXXXXXX psql -U postgres twittercannon`
