const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => (sum + blog.likes), 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((currFav, blog) => (blog.likes > (currFav?.likes ?? 0) ? blog : currFav), undefined)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}