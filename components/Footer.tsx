


const Footer = () => {
	return (
		<footer>
			<div className="footer__inner">
				<div className="footer__content">
					<div className="footer-menu">
						<div className="footer__section space">
							<a href="https://www.arweave.org/"><img src="/assets/footer-logo.svg"/></a>
							<div className="links">
								<a href="//docs.arweave.org/info/wallets/arweave-web-extension-wallet">Arweave Wallet</a>
								<a href="https://www.arweave.org/technology#papers">Papers</a>
								<a href="https://www.arweave.org/technology#blockweaves">Blockweaves and Proof of Access</a>
								<a href="https://www.arweave.org/technology#endowment">Storage Endowment</a>
								<a href="https://www.arweave.org/technology#permaweb">Permaweb</a>
								<a href="https://www.arweave.org/technology#content-moderation">Content Moderation</a>
								<a href="https://www.arweave.org/files/arweave-press-kit-2020.zip">Press Kit</a>
								<a href="//www.arweave.org/cookies-policy">Privacy Policy</a>
							</div>
						</div>
						<div className="footer__section space">
							<h4>Build</h4>
							<div className="links space_more"><a href="https://www.arweave.org/build">Start</a>
								<a href="https://www.arweave.org/build#interfaces">Interfaces</a>
								<a href="https://www.arweave.org/build#resources">Resources</a>
								<a href="http://arweave.jobs">arweave.jobs</a>
							</div>
						</div>
						<div className="footer__section space">
							<h4>Mine</h4>
							<div className="links space_more"><a href="https://www.arweave.org/mine/start">Start</a>
								<a href="https://www.arweave.org/mine/optimise">Optimise</a>
								<a href="https://www.arweave.org/mine/learn-more">Learn more</a>
							</div>
						</div>
						<div className="footer__section space">
							<h4>Get involved</h4>
							<div className="links space_more"><a href="https://www.arweave.org/get-involved/community">Community</a>
								<a href="https://www.arweave.org/get-involved/grants-funding">Grants &amp; Funding</a>
							</div>
						</div>
					</div>
					<div className="footer__content__company">
						<p>Problems? <a href="mailto:faucet@arweave.org">faucet@arweave.org</a></p>
						<hr/>
						<p>©
							Copyright 2021. Minimum Spanning Technologies Limited (10889544).
							International House, 24 Holborn Viaduct, London, EC1A 2BN, United
							Kingdom.</p>
					</div>
				</div>
				<div className="footer__content__mobile">
					<p>Problems? <a href="mailto:faucet@arweave.org">faucet@arweave.org</a></p>
					<p><a href="//www.arweave.org/cookies-policy">Privacy Policy</a></p>
					<hr/>
					<p>© Copyrights 2021 Minimum Spanning Technologies Limited</p>
				</div>
			</div>
		</footer>
	)
}

export default Footer
