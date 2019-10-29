const _ = require('lodash')

const dummy = (blogs) => 1

const totalLikes = (array) => {
  let likes = 0
  array.forEach((a) => {
    likes += a.likes
  })

  return likes
}

const favoriteBlog = (array) => array
  .reduce((acumulator, currentValue) => (acumulator.likes
    ? (currentValue.likes > acumulator.likes ? currentValue : acumulator)
    : currentValue))

const mostBlogs = (array) => {
  const authors = _.uniq(array.map((a) => a.author))
    .map((author) => {
      const blogs = array.filter((blog) => blog.author === author).length
      return {
        author,
        blogs,
      }
    })

  return authors.reduce((acumulator, currentValue) => (acumulator.blogs
    ? (currentValue.blogs > acumulator.blogs ? currentValue : acumulator)
    : currentValue))
}

const mostLikes = (array) => {
  const authors = _.uniq(array.map((a) => a.author))
    .map((author) => {
      const likes = array
        .filter((blog) => blog.author === author)
        .map(a => a.likes)
        .reduce((a, b) => a + b)

      return {
        author,
        likes,
      }
    })

  return authors.reduce((acumulator, currentValue) => (acumulator.likes
    ? (currentValue.likes > acumulator.likes ? currentValue : acumulator)
    : currentValue))
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
