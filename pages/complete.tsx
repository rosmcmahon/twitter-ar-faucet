import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import React, { ReactElement } from 'react'


const IndexPage = (): ReactElement => {
 
  return (
    <>
          <section className="card-link-section">
            <div className="card-link-section__inner center">
              <div className="card-link-section__content center">

                <h1>Successfully completed your claim!</h1>
                <p>
                  Check your keyfile and keep it safe! Arweave tokens can be used for
                  many different things.
                  <br />
                </p>

              </div>

              <div className="card-link-section__content center">
                <a href="//www.arweave.org/build" className="btn" target="_blank">
                  deploy a web app
                </a>
                <a
                  href="//www.arweave.org/use"
                  className="btn primary"
                  target="_blank" rel="noopener noreferrer"
                >
                  save a file
                </a>

              </div>
            </div>
          </section>
    </>
  )
}
export default IndexPage

