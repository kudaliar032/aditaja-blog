const { paginate } = require('gatsby-awesome-pagination')
const { forEach, uniq, filter, not, isNil, flatMap } = require('rambdax')
const path = require('path')
const { createRemoteFileNode, createFilePath } = require('gatsby-source-filesystem')
const { toKebabCase } = require('./src/helpers')

const pageTypeRegex = /src\/(.*?)\//
const getType = node => node.fileAbsolutePath.match(pageTypeRegex)[1]

const pageTemplate = path.resolve(`./src/templates/page.js`)
const postTemplate = path.resolve(`./src/templates/post.js`)
const indexTemplate = path.resolve(`./src/templates/index.js`)
const tagsTemplate = path.resolve(`./src/templates/tags.js`)

exports.createPages = ({ actions, graphql, getNodes }) => {
  const { createPage } = actions
  const allNodes = getNodes()

  return graphql(`
    {
      allMarkdownRemark(
        sort: {fields: [frontmatter___date], order: DESC}
        limit: 1000
        filter: {frontmatter: {publish: {eq: true}}}
      ) {
        edges {
          node {
            frontmatter {
              title
              tags
            }
            fileAbsolutePath
            fields {
              slug
            }
          }
        }
      }
      site {
        siteMetadata {
          postsPerPage
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }

    const {
      allMarkdownRemark: { edges: markdownPages },
      site: { siteMetadata },
    } = result.data

    const sortedPages = markdownPages.sort((pageA, pageB) => {
      const typeA = getType(pageA.node)
      const typeB = getType(pageB.node)

      return (typeA > typeB) - (typeA < typeB)
    })

    const posts = allNodes.filter(
      ({ internal, fileAbsolutePath }) =>
        internal.type === 'MarkdownRemark' &&
        fileAbsolutePath.indexOf('/posts/') !== -1,
    )

    // Create posts index with pagination
    paginate({
      createPage,
      items: posts,
      component: indexTemplate,
      itemsPerPage: siteMetadata.postsPerPage,
      pathPrefix: '/',
    })

    // Create each markdown page and post
    forEach(({ node }, index) => {
      // Generate posts
      if (node.fileAbsolutePath.indexOf('/posts/') !== -1) {
        const previous = index === 0 ? null : sortedPages[index - 1].node
        const next = index === sortedPages.length - 1 ? null : sortedPages[index + 1].node
        const isNextSameType = getType(node) === (next && getType(next))
        const isPreviousSameType = getType(node) === (previous && getType(previous))
        createPage({
          path: node.fields.slug,
          component: postTemplate,
          context: {
            type: getType(node),
            next: isNextSameType ? next : null,
            previous: isPreviousSameType ? previous : null,
          },
        })
      // Generate pages
      } else {
        createPage({
          path: node.fields.slug,
          component: pageTemplate,
          context: {
            type: getType(node),
          },
        })
      }
    }, sortedPages)

    // Create tag pages
    const tags = filter(
      tag => not(isNil(tag)),
      uniq(flatMap(post => post.frontmatter.tags, posts)),
    )

    forEach(tag => {
      const postsWithTag = posts.filter(
        post =>
          post.frontmatter.tags && post.frontmatter.tags.indexOf(tag) !== -1,
      )

      paginate({
        createPage,
        items: postsWithTag,
        component: tagsTemplate,
        itemsPerPage: siteMetadata.postsPerPage,
        pathPrefix: `/tag/${toKebabCase(tag)}`,
        context: {
          tag,
        },
      })
    }, tags)

    return {
      sortedPages,
      tags,
    }
  })
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      coverImage: File @link(from: "coverImage___NODE")
    }
    
    type Frontmatter {
      title: String!
      author: String
      date: Date! @dateformat
      tags: [String!]
      excerpt: String
      coverImageUrl: String
      publish: Boolean
    }
  `)
}

exports.onCreateNode = async ({
  node,
  actions: { createNode, createNodeField },
  store,
  cache,
  createNodeId,
  getNode,
}) => {
  if (node.internal.type === 'MarkdownRemark') {
    // Generate cover image
    const forCoverImage = node.frontmatter.coverImageUrl !== '' &&
      node.frontmatter.coverImageUrl !== undefined
    if (forCoverImage) {
      const fileNode = await createRemoteFileNode({
        url: node.frontmatter.coverImageUrl,
        parentNodeId: node.id,
        createNode,
        createNodeId,
        cache,
        store,
      })
      if (fileNode) {
        node.coverImage___NODE = fileNode.id
      }
    }

    // Generate slug
    const slug = createFilePath({ node, getNode, trailingSlash: false })
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}