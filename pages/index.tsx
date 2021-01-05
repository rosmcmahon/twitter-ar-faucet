import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { Button, Container, Step, StepContent, Stepper, Typography } from '@material-ui/core'
import Arweave from 'arweave'
import LinkUnstyled from '../components/LinkUnstyled'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Spinner from '../components/Spinner'
import Claim from '../components/Claim'
import Download from '../components/Download'
import { serverLoop } from '../server/server-loop'
import { logger } from '../utils/logger'

const arweave = Arweave.init({ host: 'arweave.net' })

const Index = ({ jwk, address }: InferGetServerSidePropsType<typeof getServerSideProps>): ReactElement => {
  const [active, setActive] = useState(0)

	const onClickNext = () => {
		setActive(step => step + 1)
  }

  useEffect(() => {
    console.log('UI address', address)
  }, [])
  
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
						<Spinner address={address} onClickNext={onClickNext} />
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
  
  const jwk = await arweave.wallets.generate()
  const address = await arweave.wallets.jwkToAddress(jwk)
  
  logger(address, 'NEW PAGE LOAD')

  /* IP Blacklist Code */

  //get incoming IP address
  // console.log('connection', context.req.connection.remoteAddress) //https only
  console.log('remoteAddress', context.req.socket.remoteAddress)
  console.log('address()', context.req.socket.address())
  /** TODO: 
   * - check against blacklist here. 
   * - keep list in db. 
   * - how do we quantify abuse?
   */
  
  /* Set off the server loop asynchronously */

  serverLoop(address) //async, never wait

  return{
    props: {
      jwk,
      address,
    }
  }
}
