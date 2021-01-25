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
npx greenlock add --subject faucet.arweave.net --altnames faucet.arweave.net
npm start
```

That's all ;-)


<!-- 
npx next telemetry disable
pm2 start npm --name "tcannon" -- run "start"

sudo apt-get install libcap2-bin 
sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\`` 

npx greenlock add --subject yourdomain.com --altnames yourdomain.com,www.yourdomain.com

-->
