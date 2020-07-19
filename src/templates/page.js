import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import SEO from '../components/seo'
import Layout from '../components/layout'
import Page from '../components/page'

const BlogPageTemplate = ({ data }) => {
  const {
    frontmatter: { title, showTitle },
    autoExcerpt,
    id,
    html,
  } = data.markdownRemark

  return (
    <Layout>
      <SEO title={title} description={autoExcerpt} />
      <Page
        key={id}
        title={title}
        showTitle={showTitle}
        html={html}
      />
    </Layout>
  )
}

export default BlogPageTemplate

BlogPageTemplate.propTypes = {
  data: PropTypes.object.isRequired,
}

export const pageQuery = graphql`
  query($path: String) {
    markdownRemark(fields: {slug: {eq: $path}}) {
      frontmatter {
        title
        showTitle  
      }
      id
      html
    }
  }
`
