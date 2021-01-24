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
npx next telemetry disable
pm2 start npm --name "tcannon" -- run "start"

sudo apt install certbot 
#sudo apt install nginx python3-certbot-nginx
#sudo certbot --nginx
#edit /etc/nginx/sites-available/default
#ssl_certificate /etc/letsencrypt/live/arweavewallet.com/fullchain.pem;
#ssl_certificate_key /etc/letsencrypt/live/arweavewallet.com/privkey.pem;

-->
