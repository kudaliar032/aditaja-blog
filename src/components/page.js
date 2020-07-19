import React from 'react'
import PropTypes from 'prop-types'
import Img from 'gatsby-image'

import style from '../styles/post.module.css'

const Page = ({
  title,
  coverImage,
  html,
}) => (
  <div className={style.post}>
    <div className={style.postContent}>
      <h1 className={style.title}>{title}</h1>

      {coverImage && (
        <Img
          fluid={coverImage.childImageSharp.fluid}
          className={style.coverImage}
        />
      )}

      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  </div>
)

Page.propTypes = {
  title: PropTypes.string,
  coverImage: PropTypes.object,
  html: PropTypes.string,
}

export default Page