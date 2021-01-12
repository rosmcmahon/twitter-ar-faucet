import { Button, Checkbox, Container, FormControlLabel, Paper, Typography } from '@material-ui/core'
import React from 'react'
import Claim from '../components/Claim'
import Footer from '../components/Footer'

const IndexPage = () => {
  return (
    <>
      <div className="layout__inner">
        <div className="page">
          <div className="page__content homepage">
            <section 
              className="card-link-section aos-init aos-animate" 
              data-aos="fade-up" data-aos-easing="linear"
              data-aos-duration="500"
            >
              <div className="card-link-section__inner center">
                <div className="card-link-section__content center">


                  <h1>Store data, permanently.</h1>
                  <p>Arweave enables you</p>
                  <p> to store documents and applications forever.</p><a className="btn"
                    href="https://www.arweave.org/#arweave-intro">LEARN MORE</a>
                  

                  <Container>
                    <Typography variant='h4'>Store data on the permaweb for free</Typography>
                    <Typography variant='body1'>
                      <p>You first need some Arweave tokens which we’d like to send you for free together with a wallet. You'll be amazed how far it'll go!</p>
                      <p>*Note: You need an existing Twitter account for this.</p>
                      Instructions:
                      <ol>
                        <li>Agree to the terms</li>
                        <li>Click the "CLAIM" button to open a Twitter popup</li>
                        <li>Post the Tweet using your Twitter account</li>
                        <li>Click next once done</li>
                      </ol>
                      <FormControlLabel
                        control={<Checkbox color='primary' checked={false} />}
                        label='I agree to the privacy policy'
                      />
                      <br/>
                      <Button  variant='contained' >Claim tokens with Twitter</Button>
                      <button disabled={true}  className='btn' >Claim tokens with Twitter</button>
                      <br/>
                      <br/>
                      <button disabled={false}  className='btn' >Next</button>
                    </Typography>
                  </Container>


                </div>
              </div>
            </section><a className="anchor" id="arweave-intro"></a>
          </div>
        </div>
      </div>
    </>
  )
}

export default IndexPage
