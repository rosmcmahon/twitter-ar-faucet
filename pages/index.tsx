import React, { ReactElement, useRef, useState } from 'react'
import { Button, Container, Typography } from '@material-ui/core'
import Arweave from 'arweave'
import LinkUnstyled from '../components/LinkUnstyled'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import axios from 'axios'
import { isBot } from '../services/bot-check'
import { transferAr } from '../services/transfer-ar'

const arweave = Arweave.init({ host: 'arweave.net' })

const Index = ({ jwk, address }: InferGetServerSidePropsType<typeof getServerSideProps>): ReactElement => {
  const refDownloadAnchor = useRef<HTMLAnchorElement>(null)
  const filename = 'arweave-key-' + address + '.json'
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jwk))

  const onPostTweet = () => {
    if(typeof window !== 'undefined'){
      const text = encodeURI("A001 ")
  
      const wref = window.open(
        `https://twitter.com/intent/tweet?text=${text}${address}`,
        "twitpostpopup",
        `left=${window.screenX + 100},top=${window.screenY + 100},width=500,height=448,toolbar=no`
      )
    }
  }



  return (
    <Container>
      <Typography variant="h4">Twitter bot</Typography>

      <Typography variant='body1'>Please allow popup for Twitter tweet, and then </Typography>
      <Button variant='contained' onClick={onPostTweet}>Post a Tweet</Button>

      <Button variant='contained' onClick={()=>refDownloadAnchor.current!.click()} >
        Download new wallet
      </Button>
      <a
        ref={refDownloadAnchor} 
        href={dataUri} 
        download={filename} 
        target='_blank' 
        style={{visibility:'hidden',position:'absolute'}}
      >	{filename} </a>

      
    </Container>
  )
}
export default Index

export const getServerSideProps: GetServerSideProps = async (context) => {
  const jwk = await arweave.wallets.generate()
  const address = await arweave.wallets.jwkToAddress(jwk)

  /**
   * When publish by API is written, this code can be changed to wait once 
   * for, say, 30 seconds after the publish code is run.
   */
  let tries = 3
  const timerId = setInterval(async () => {
    if(await searchForTweet(address)){
      console.log(address, 'tweet found & processed')
      clearInterval(timerId)
    }
    if(!tries--){
      console.log('giving up searching for tweet.')
      clearInterval(timerId)
    }
  }, 10000)

  return{
    props: {
      jwk,
      address 
    }
  }
}

/**
 * For brevity we just search that the wallet was mentioned by anyone at all without further checks.
 * TODO: 
 * - only check tweets sent from the logged-in user
 * - check user has not already claimed
 * + DONE check user is not a bot
 * - etc
 */
const searchForTweet = async (address2: string) => {
  //DEBUG:
  // const address = address2
  const address = 'DF0dxHueHaNAp3I_0q5I0EwJTtWQogvOUZR2x-ADx6Q' // @rosmcmahon_real
  // const address = 'U5p5oWnzTrs2-4nmd4VWkpxoTSHQOukWtGqq27-zWnw' // @RodSchuffler

  console.log('searching for', address)

	const res = await axios({
		method: 'GET',
		url: 'https://api.twitter.com/1.1/search/tweets.json',
		params: {
			q: address
		},
		headers: {
			Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
		}
	})

	console.log(res.data.statuses.length)
  if(res.data.statuses.length > 0){
    console.log(res.data.statuses[0].text)
    let twitterHandle = res.data.statuses[0].user.screen_name
    console.log(twitterHandle)

    if(await isBot(twitterHandle)){
      console.log('BOT DETECTED!')
      //TODO: log the details
      //TODO: flag to Sophie mechanism?
    } else {
      const txid = await transferAr(address)

    }

    return true
  }
  return false
}