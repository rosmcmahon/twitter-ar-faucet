import { Button, Container } from '@material-ui/core'
import { GetServerSideProps } from 'next'
import React from 'react'
import {  } from 'twitter-lite'

const Signup = () => {

	const onClickHandler = async () => {

	}

	return (
		<Container>
			<h1>Sign up</h1>
			<p>blah blah blah</p>
			<Button variant='contained' onClick={onClickHandler}>Sign up with Twitter</Button>
		</Container>
	)
}
export default Signup

export const getServerSideProps: GetServerSideProps = async (context) => {
	return{
		props: {}
	}
}