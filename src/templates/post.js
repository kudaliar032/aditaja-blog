import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import SEO from '../components/seo'
import Layout from '../components/layout'
import Post from '../components/post'

const BlogPostTemplate = ({ data, pageContext }) => {
  const {
    frontmatter: { title, date, author, excerpt, tags },
    coverImage,
    fields: {
      slug,
    },
    excerpt: autoExcerpt,
    id,
    html,
  } = data.markdownRemark
  const { next, previous } = pageContext

  return (
    <Layout>
      <SEO title={title} description={excerpt || autoExcerpt} />
      <Post
        key={id}
        id={id}
        title={title}
        date={date}
        slug={slug}
        author={author}
        coverImage={coverImage}
        html={html}
        tags={tags}
        previousPost={previous}
        nextPost={next}
      />
    </Layout>
  )
}

export default BlogPostTemplate

BlogPostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.shape({
    next: PropTypes.object,
    previous: PropTypes.object,
  }),
}

export const pageQuery = graphql`
  query($path: String) {
    markdownRemark(fields: {slug: {eq: $path}}) {
      frontmatter {
        title
        date(formatString: "DD MMMM YYYY")
        author
        excerpt
        tags
      }
      coverImage {
        childImageSharp {
          fluid(maxWidth: 800) {
            ...GatsbyImageSharpFluid
          }
        }
      }
      fields {
        slug
      }
      id
      html
      excerpt
    }
  }
`
