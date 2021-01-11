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
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <div style={{display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100vh'}}>
          <Header/>
          <Component {...pageProps} />
          <Footer/>
        </div>
      </ThemeProvider>
    </>
  )
}
