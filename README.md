# Twitter Cannon

## Requirements

- Twitter developer account 
- Botomoeter API account
- install postgres

## Install & run

- copy `.env.example` to `.env` and complete all the details.
- copy the arweave faucet jwk to `secrets/jwk.json`
- run the following

```sql
CREATE DATABASE twittercannon ENCODING 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8' TEMPLATE template0;
CREATE USER twittercannon WITH ENCRYPTED PASSWORD 'mypass';
GRANT ALL PRIVILEGES ON DATABASE twittercannon TO twittercannon;
sudo -u postgres -- psql -d twittercannon -f twittercannon.pgsql 
```
```
npm install
npm run build
npm start
```

That's all ;-)


<!-- 
sudo -u postgres -- psql -c 'create database `<DB_USER>`'
sudo -u postgres -- psql -d targetdb -f sourcedb.sql
psql -f /some/path/my_script_name.sql — The -f option will instruct psql to execute the file. This is arguably the most critical of all the options.
-->
