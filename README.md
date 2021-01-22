# Twitter Cannon

## Requirements

- Twitter developer account 
- Botomoeter API account
- install docker, docker-compose
- enable ports 22,80,443 (ufw for example)

## Install & run

- copy `.env.example` to `.env` and complete all the details.
- copy the arweave faucet jwk to `secrets/jwk.json`
- run the following

```bash
sudo mkdir /mnt/custom-volume # permissions?
docker-compose up --build -d
npm start
```

That's all ;-)


<!-- 
sudo -u postgres -- psql -c 'create database `<DB_USER>`'
sudo -u postgres -- psql -d targetdb -f sourcedb.sql
psql -f /some/path/my_script_name.sql — The -f option will instruct psql to execute the file. This is arguably the most critical of all the options.
-->
