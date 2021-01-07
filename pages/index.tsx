import React, { ReactElement, useEffect, useState } from 'react'
import { Button, Paper, Step, StepContent, StepLabel, Stepper, Typography } from '@material-ui/core'
import Arweave from 'arweave'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Spinner from '../components/Spinner'
import Claim from '../components/Claim'
import Download from '../components/Download'
import { serverLoop } from '../server/server-loop'
import { logger } from '../utils/logger'
import theme from '../styles/theme'

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
			<Stepper activeStep={active} orientation='vertical' style={{marginBottom: theme.spacing(2)}}>
				<Step key={'claim'}>
          <StepLabel>Post the Tweet</StepLabel>
					<StepContent>
						<Claim address={address} onClickNext={onClickNext} />
					</StepContent>
				</Step>
				<Step key={'step key middle'}>
          <StepLabel>Await Tweet Processing</StepLabel>
					<StepContent>
						<Spinner address={address} onClickNext={onClickNext} />
					</StepContent>
				</Step>
				<Step key={'step key bottom'}>
          <StepLabel>Download Your New Wallet!</StepLabel>
					<StepContent>
						<Download address={address} jwk={jwk} onClickNext={onClickNext} />
					</StepContent>
				</Step>
      </Stepper>
      {active === 3 && (
        <Paper square elevation={0} style={{ padding: theme.spacing(3) }}>
          <Typography>All steps completed - Let's see what your wallet can do!</Typography>
          <Button 
            variant='contained' color='primary'
            onClick={()=> window.open('https://www.arweave.org/wallet/complete')}
            style={{marginTop: theme.spacing(1), marginRight: theme.spacing(1)}}
          >
            Explore
          </Button>
        </Paper>
      )}
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
