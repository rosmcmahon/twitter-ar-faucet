import React, { ReactElement, useRef, useState } from 'react'
import { Button, Container, Typography } from '@material-ui/core'
import Arweave from 'arweave'
import LinkUnstyled from '../components/LinkUnstyled'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import axios from 'axios'
import { isBot } from '../services/bot-check'

const arweave = Arweave.init({ host: 'arweave.net' })

const Index = ({ jwk, address }: InferGetServerSidePropsType<typeof getServerSideProps>): ReactElement => {
  const refDownloadAnchor = useRef<HTMLAnchorElement>(null)

  const filename = 'arweave-key-' + address + '.json'
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jwk))
  
  if(typeof window !== 'undefined'){
    const text = encodeURI("A001 ")

    /**
     * The app is using a no-auth window to fill in the text for the user.
     * This might fail if the user does not notice a blocked popup window.
     * Future version will use "3-legged OAuth" from the Twitter API to send
     * on the user's behalf from this webpage for a smoother experience. It 
     * is omitted now for brevity, as 3-legged OAuth requires quite a lot of
     * set up steps, but it will be included in the final app.
     */
    window.open(
      `https://twitter.com/intent/tweet?text=${text}${address}`,
      "mywin",
      "left=20,top=20,width=500,height=448,toolbar=1,resizable=0"
    );
  }


  return (
    <Container>
      <Typography variant="h4">Twitter bot</Typography>

      <Typography variant='body1'>Please allow popup for Twitter tweet, and then </Typography>

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
      console.log(address, 'found. Sending all the money rn!')
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
 * - check user has not already claimed
 * - check user is not a bot
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
    }

    return true
  }
  return false
}