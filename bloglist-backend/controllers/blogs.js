const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')


blogsRouter.post('/', middleware.userExtractor, async (request, response) => {

  const user = request.user

  const blog = new Blog({ ...request.body, user: user._id })
  const result = await blog.save()
  user.blogs = [...user.blogs, result._id]
  await user.save()
  response.status(201).json(result)
})

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user')
  response.json(blogs)
})

blogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).end()
  }
  blog.likes = likes
  const updatedBlog = await blog.save()
  return response.json(updatedBlog)


})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

  const user = request.user
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).end()
  }

  if (blog.user.toString() === user._id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    user.blogs = user.blogs.filter(b => b.toString() !== request.params.id)
    await user.save()
  } else {
    response.status(401).json({ error: 'Unauthorized' })
  }


  response.status(204).end()
})

module.exports = blogsRouter