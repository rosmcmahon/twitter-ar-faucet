import { Button, Checkbox, Container, FormControlLabel, Paper, Typography } from '@material-ui/core'
import React, { useState } from 'react'
import Claim from '../components/Claim'
import Footer from '../components/Footer'

const IndexPage = () => {
  const [ready, setReady] = useState(false)
  return (
    <>
      <div className="page">
        <div className="page__content homepage ">
          <section 
            className="card-link-section aos-init aos-animate" 
            data-aos="fade-up" data-aos-easing="linear"
            data-aos-duration="500"
          >
            <div className="card-link-section__inner center">
              <div className="card-link-section__content center">

                <h1>Store data on the permaweb for free</h1>
                
                <p>
                  You first need some Arweave tokens which we’d like to send you for free together with a wallet. You'll be amazed how far it'll go!
                </p>
                *Note: You need an existing Twitter account.<br/>
                <br/>
                Instructions:
                <ol>
                  <li>Click the "CLAIM" button to open a Twitter popup</li>
                  <li>Post the Tweet using your Twitter account</li>
                  <li>Click next once done</li>
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
                    <span className='checkmark'></span>
                      I am ready to post a pre-written Tweet
                  </label>

                  <button 
                    disabled={!ready} 
                    className='btn' 
                    type='button'
                    onClick={()=>window.location.href='/steps'} 
                  >
                    Post Tweet
                  </button>
                </form>

              </div>
            </div>
          </section><a className="anchor" id="arweave-intro"></a>
        </div>
      </div>
    </>
  )
}

export default IndexPage
