import React from 'react'
import PropTypes from 'prop-types'
import Img from 'gatsby-image'

import style from '../styles/post.module.css'

const Page = ({
  title,
  date,
  coverImage,
  author,
  html,
}) => (
  <div className={style.post}>
    <div className={style.postContent}>
      <h1 className={style.title}>{title}</h1>
      <div className={style.meta}>
        {date} {author && <>— Written by {author}</>}
      </div>

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
  date: PropTypes.string,
  coverImage: PropTypes.object,
  author: PropTypes.string,
  html: PropTypes.string,
}

export default Page
