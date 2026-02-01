const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const { nonExistingId } = require('./test_helper')

const api = supertest(app)


describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  describe('viewing blogs', () => {


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
  })

  describe('adding blogs', () => {
    test('a valid blog can be added ', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        url: 'ts.netzmal.de/blogs/async',
        author: 'Torge Schöwing',
        likes: 69
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(n => n.title)
      assert(titles.includes('async/await simplifies making async calls'))
    })

    test('missing likes default to 0 ', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        url: 'ts.netzmal.de/blogs/async',
        author: 'Torge Schöwing',
      }

      const result = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      assert.strictEqual(result.body.likes, 0)
    })

    test('missing title returns 400 ', async () => {
      const newBlog = {
        url: 'ts.netzmal.de/blogs/async',
        author: 'Torge Schöwing',
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })

    test('missing url returns 400 ', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'Torge Schöwing',
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
  })

  describe('deleting blogs', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      const ids = blogsAtEnd.map(n => n.id)
      assert(!ids.includes(blogToDelete.id))

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })

  })

  describe('updating blogs', () => {

    test('correctly updates the likes', async () => {

      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      await api.put(`/api/blogs/${blogToUpdate.id}`).send({ likes: 67 }).expect(200)

      const blogsAtEnd = await helper.blogsInDb()

      const updatedBlogs = blogsAtEnd.filter(n => n.id === blogToUpdate.id)

      assert.notStrictEqual(updatedBlogs, undefined)
      assert.notStrictEqual(updatedBlogs, [])
      assert.strictEqual(updatedBlogs.length, 1)
      assert(updatedBlogs[0].likes !== blogToUpdate.likes)
      assert.strictEqual(updatedBlogs[0].likes, 67)

    })

  })

})


after(async () => {
  await mongoose.connection.close()
})