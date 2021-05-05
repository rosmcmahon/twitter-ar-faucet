import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import React, { ReactElement, useState } from 'react'
import Maintenance from '../components/Maintenance'
import TwitterLimit from '../components/TwitterLimit'
import { getDbHeartbeat } from '../utils/db-heartbeat'
import { storeIP } from '../utils/fifo-ip'
import { logger } from '../utils/logger'
import { getRateLimitWait } from '../utils/ratelimit-singletons'

const IndexPage = ({ dbHeartbeat, rateLimit }: InferGetServerSidePropsType<typeof getServerSideProps>): ReactElement => {
  const [ready, setReady] = useState(false)
  if(!dbHeartbeat){
    return <Maintenance/>
  }
  if(rateLimit){
    return <TwitterLimit/>
  }
  return (
    <>
          <section className="card-link-section">
            <div className="card-link-section__inner center">
              <div className="card-link-section__content center">

                <h1>Store data on the permaweb for free.</h1>
                
                <p>
                  You first need some Arweave tokens which we’d like to send you for free together with a wallet. You'll be amazed how far it'll go!
                </p>
                <p>
                  Arweave tokens are in high demand, so we need to perform a strong test to check you are a human before sending them to you 🤖.
                </p>
                <p>
                  You will need to send a tweet from an active Twitter account to prove this to us -- we will then use your public profile to verify you.
                </p>
                <p>
                  Alternatively, remember that you can always buy a small number of tokens from an exchange to get started!
                </p>
                <br/>
                Instructions:
                <ol>
                  <li>Download &amp; save your new wallet (.JSON key file). You only have 1 chance to do this.</li>
                  <li>Post the tweet using your Twitter account.</li>
                  <li>Hit 'Next' once done.</li>
                </ol>

                <form noValidate={true}>
                  <label 
                    htmlFor='readyNext'
                    className='checkbox-container'
                  >
                    <input 
                      type='checkbox' 
                      id='readyNext' name='readyNext' 
                      value={ready.toString()}
                      onChange={()=>setReady(!ready)} 
                    />
                    <span className='checkmark'/>
                    I am ready to follow the above instructions, and agree to the Privacy Policy.
                  </label>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <button 
                      disabled={!ready} 
                      className='btn' 
                      type='button'
                      onClick={()=>window.location.href='/steps'} 
                    >
                      Continue
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </section>
    </>
  )
}
export default IndexPage

export const getServerSideProps: GetServerSideProps = async (context) => {

  const ip = context.req.socket.remoteAddress
  
  ip && storeIP(ip)
  
  const dbHeartbeat = await getDbHeartbeat()
  const rateLimit = (getRateLimitWait() > 0)

  logger(ip, 'index page load', 'HB:'+dbHeartbeat, 'TwitterRL:'+rateLimit, new Date().toUTCString())
  
  return{
    props: {
      dbHeartbeat,
      rateLimit,
    }
  }
}