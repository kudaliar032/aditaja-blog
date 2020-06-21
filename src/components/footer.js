import React from 'react'
import PropTypes from 'prop-types'

const date = new Date()

const Footer = ({ copyrights }) => (
  <footer>
    {copyrights ? (
      <div
        dangerouslySetInnerHTML={{
          __html: copyrights,
        }}
      />
    ) : (
      <>
        <span className="footerCopyrights">
          © {date.getFullYear()} Make with <span className="footerHeart">&hearts;</span>
        </span>
        <span className="footerCopyrights">
          Theme by <a href="https://radoslawkoziel.pl">panr</a>
        </span>
      </>
    )}
  </footer>
)

Footer.propTypes = {
  copyrights: PropTypes.string,
}

export default Footer
