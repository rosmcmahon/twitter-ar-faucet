import React, { ReactElement } from 'react'
import Head from 'next/head'
import { AppProps } from 'next/app'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import theme from '../styles/theme'
import '../styles/arweaveOrg.css'
import Footer from '../components/Footer'
import Header from '../components/Header'


export default function App({ Component, pageProps }: AppProps): ReactElement {
  return (
    <>
      <Head>
        <title>Arweave Claim A Token</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="layout">
        <div className="layout__inner">
        <div className="page">
        <div className="page__content homepage ">
          <Header/>
          <Component {...pageProps} />
        </div>
        </div>
        </div>
        <Footer/>
        </div>
      </ThemeProvider>
    </>
  )
}
