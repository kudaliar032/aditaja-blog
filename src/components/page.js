import React from 'react'
import PropTypes from 'prop-types'

import style from '../styles/post.module.css'

const Page = ({
  title,
  showTitle,
  html,
}) => (
  <div className={style.post}>
    <div className={style.postContent}>
      {showTitle && (<h1 className={style.title}>{title}</h1>)}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  </div>
)

Page.propTypes = {
  title: PropTypes.string,
  showTitle: PropTypes.bool,
  html: PropTypes.string,
}

export default Page