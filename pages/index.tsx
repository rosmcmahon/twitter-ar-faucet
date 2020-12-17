import React, { ReactElement, useRef, useState } from 'react'
import { Button, Container, Step, StepContent, Stepper, Typography } from '@material-ui/core'
import Arweave from 'arweave'
import LinkUnstyled from '../components/LinkUnstyled'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Spinner from '../components/Spinner'
import Claim from '../components/Claim'
import Download from '../components/Download'

const arweave = Arweave.init({ host: 'arweave.net' })

const Index = ({ jwk, address }: InferGetServerSidePropsType<typeof getServerSideProps>): ReactElement => {
  const [active, setActive] = useState(0)

	const onClickNext = () => {
		setActive(step => step + 1)
  }
  
  return (
    <>
			<Stepper activeStep={active} orientation='vertical'>
				<Step key={'claim'}>
					<StepContent>
						<Claim address={address} onClickNext={onClickNext} />
					</StepContent>
				</Step>
				<Step key={'step key middle'}>
					<StepContent>
						<Spinner onClickNext={onClickNext} />
					</StepContent>
				</Step>
				<Step key={'step key bottom'}>
					<StepContent>
						<Download address={address} jwk={jwk} />
					</StepContent>
				</Step>



      </Stepper>
    </>
  )
}
export default Index

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log('******************************************************************************************************************************************************************************')

  const jwk = await arweave.wallets.generate()
  const address = await arweave.wallets.jwkToAddress(jwk)

  // get incoming IP address
  console.log('connection', context.req.connection.remoteAddress) //https only
  console.log('socket', context.req.socket.remoteAddress)
  console.log('socket', context.req.socket.address())
  //TODO: check against blacklist here. keep in db? how do we quantify abuse?
  

  // const timerId = setInterval(async () => {
  //   if(await getTweetUser(address)){
  //     console.log(address, 'tweet found & processed')
  //     clearInterval(timerId)
  //   }
  //   if(false){
  //     clearInterval(timerId)
  //   }
  // }, 10000)

  return{
    props: {
      jwk,
      address,
    }
  }
}
