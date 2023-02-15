


const Footer = () => {
	return (
		<footer>
			<div className="footer__inner">
				<div className="footer__content">
					<div className="footer-menu">
						<div className="footer__section space">
							<a href="https://www.arweave.org/"><img src="/assets/footer-logo.svg"/></a>
							<div className="links">
								<a href="//docs.arweave.org/info/wallets">Arweave Wallet</a>
								<a href="//yellow-paper.arweave.dev">Yellow Paper</a>
								<a href="//2-6-spec.arweave.dev">2.6 Spec</a>
								<a href="//docs.arweave.org/policies/privacy-policy">Privacy Policy</a>
							</div>
						</div>
						<div className="footer__section space">
							<h4>Build</h4>
							<div className="links space_more">
								<a href="https://www.arweave.org/build">Start</a>
								<a href="https://github.com/ArweaveTeam/arweave-js">ArweaveJS</a>
								<a href="https://cookbook.arweave.dev/getting-started/welcome.html">Cookbook</a>
							</div>
						</div>
						<div className="footer__section space">
							<h4>Mine</h4>
							<div className="links space_more"><a href="//docs.arweave.org/mine/start">Start</a>
								<a href="//docs.arweave.org/mine/optimise">Optimise</a>
								<a href="//docs.arweave.org/mine/learn-more">Learn more</a>
							</div>
						</div>
						<div className="footer__section space">
							<h4>Get involved</h4>
							<div className="links space_more">
								<a href="https://discord.gg/AhsZfBm">Community</a>
								<a href="https://www.arweave.org/funding">Grants &amp; Funding</a>
								<a href="http://arweave.jobs">Ecosystem Jobs</a>
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
