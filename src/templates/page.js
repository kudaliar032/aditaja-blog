import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import SEO from '../components/seo'
import Layout from '../components/layout'
import Page from '../components/page'

const BlogPageTemplate = ({ data, pageContext }) => {
  const {
    frontmatter: { title, path },
    coverImage,
    autoExcerpt,
    id,
    html,
  } = data.markdownRemark
  const { next, previous } = pageContext

  return (
    <Layout>
      <SEO title={title} description={autoExcerpt} />
      <Page
        key={id}
        title={title}
        path={path}
        coverImage={coverImage}
        html={html}
        previousPost={previous}
        nextPost={next}
      />
    </Layout>
  )
}

export default BlogPageTemplate

BlogPageTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.shape({
    next: PropTypes.object,
    previous: PropTypes.object,
  }),
}

export const pageQuery = graphql`
  query($path: String) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      frontmatter {
        title
        path
      }
      coverImage {
        childImageSharp {
          fluid(maxWidth: 800) {
            ...GatsbyImageSharpFluid
          }
        }
      }
      id
      html
    }
  }
`
