const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('all blogs are returned and being in JSON format', async () => {
  const response = await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)


  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('returned blogs have id and not _id as identifier', async () => {
  const response = await api.get('/api/blogs')

  const firstBlog = response.body[0]
  console.log(firstBlog, 'id' in firstBlog, '_id' in firstBlog)

  assert('id' in firstBlog)
  assert(!('_id' in firstBlog))
})

after(async () => {
  await mongoose.connection.close()
})