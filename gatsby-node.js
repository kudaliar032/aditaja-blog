const { paginate } = require('gatsby-awesome-pagination')
const { forEach, uniq, filter, not, isNil, flatMap } = require('rambdax')
const path = require('path')
const { createRemoteFileNode } = require('gatsby-source-filesystem')
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
        sort: { fields: [frontmatter___date], order: DESC }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              title
              tags
            }
            fileAbsolutePath
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
      const previous = index === 0 ? null : sortedPages[index - 1].node
      const next = index === sortedPages.length - 1 ? null : sortedPages[index + 1].node
      const isNextSameType = getType(node) === (next && getType(next))
      const isPreviousSameType = getType(node) === (previous && getType(previous))

      // select page or post
      if (node.fileAbsolutePath.indexOf('/posts/') !== -1) {
        createPage({
          path: path.basename(node.fileAbsolutePath, `.md`),
          component: postTemplate,
          context: {
            type: getType(node),
            next: isNextSameType ? next : null,
            previous: isPreviousSameType ? previous : null,
          },
        })
      } else {
        createPage({
          path: path.basename(node.fileAbsolutePath, `.md`),
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
    }
  `)
}

exports.onCreateNode = async ({
  node,
  actions: { createNode },
  store,
  cache,
  createNodeId,
}) => {
  if (
    node.internal.type === 'MarkdownRemark' &&
    node.frontmatter.coverImageUrl !== null
  ) {
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
}

// exports.sourceNodes = ({ actions }) => {
//   const { createTypes } = actions
//   const typeDefs = `
//     type MarkdownRemark implements Node {
//       frontmatter: Frontmatter!
//       coverImage: File @link(from: "coverImage___NODE")
//     }
//
//     type Frontmatter {
//       title: String!
//       author: String
//       date: Date! @dateformat
//       tags: [String!]
//       excerpt: String
//       coverImageUrl: String
//     }
//   `
//   createTypes(typeDefs)
// }
