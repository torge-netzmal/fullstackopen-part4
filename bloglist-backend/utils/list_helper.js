var _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => (sum + blog.likes), 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((currFav, blog) => (blog.likes > (currFav?.likes ?? 0) ? blog : currFav), undefined)
}

const mostBlogs = (blogs) => {
  const [author, count] = _.chain(blogs).countBy(blog => blog.author).toPairs().maxBy(p => p[1])
  return { 'author': author, 'blogs': count }
}

const mostLikes = (blogs) => {
  const res = _.chain(blogs)
    .groupBy(blog => blog.author)
    .toPairs()
    .map(blogsBy => ({ author: blogsBy[0], likes: _.sumBy(blogsBy[1], 'likes') }))
    .maxBy(p => p.likes)
    .value()

  return { author: res?.author, likes: res?.likes }
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}