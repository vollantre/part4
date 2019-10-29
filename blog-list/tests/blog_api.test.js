const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const helper = require('./test_helper')

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})

  for(let blog of helper.inititalBlogs){
    const blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('return all blogs', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body.length).toBe(helper.inititalBlogs.length)
  })

  describe('viewing a scpecific blog', () => {
    test('identifier property of each blog is id instead of _id', async () => {
    const blogs = await helper.blogsInDb()
    const blogToCheck = blogs[0]
  
    expect(blogToCheck.id).toBeDefined()
    })
  })

  describe('addition of a new blog', () => {
    test('add a blog to the database', async () => {
      const inititalBlogs = await helper.blogsInDb()
      const blogObject = new Blog({
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5})
    
      await api
        .post('/api/blogs')
        .send(blogObject)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
      const response = await api
        .get('/api/blogs')
    
      const blogs = response.body.map(b => b.title)
    
      expect(response.body.length).toBe(inititalBlogs.length + 1)
      expect(blogs).toContain(blogObject.title)
    })
    
    test('if likes property is missing set it to zero', async () => {
      const blogObject = new Blog({
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html'
      })
    
      const result = await api
        .post('/api/blogs')
        .send(blogObject)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      
      const addedBlog = result.body
    
      expect(addedBlog.likes).toBeDefined()
      expect(addedBlog.likes).toBe(0)
    })

    test('blog without title and url properties are not added', async () => {
      const blogObject = new Blog(
        {
          author: 'Edsger W. Dijkstra',
          likes: 5
        }
      )
    
      await api
        .post('/api/blogs')
        .send(blogObject)
        .expect(400)
    
      const response = await api.get('/api/blogs')
      const blogsAtEnd = response.body
    
      expect(blogsAtEnd.length).toBe(helper.inititalBlogs.length)
    })
  })

  describe('deletion of a single blog', () => {
    test('succeeds if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToRemove = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToRemove.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1)

      const blogs = blogsAtEnd.map(b => b.title)
      expect(blogs).not.toContain(blogToRemove.title)
    })
  })

  describe('updating a single blog', () => {
    test('succeeds if id is valid', async () => {
      const blogObject = helper.inititalBlogs[0]
      
      await api
        .put(`/api/blogs/${blogObject._id}`)
        .send({...blogObject, likes: 1000 })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlog = blogsAtEnd.find(b => b.id === blogObject._id)

      expect(updatedBlog.likes).toBe(1000)
    })
  })

  describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
      const user = new User({ username: 'voll', password: 'tuculo' })
      await user.save()
    })

    test('creation suceeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'Mamberroi',
        name: 'Kiki',
        password: 'abudacity'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

      const users = usersAtEnd.map(u => u.username)
      expect(users).toContain(newUser.username)
    })

    describe('when creation of a new user has an invalid username', () => {
      test('creation fails if current username does exist in db', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'voll',
          password: 'abudacity'
        }

        const response = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length)

        expect(response.body.error).toBe('User validation failed: username: Error, expected `username` to be unique. Value: `voll`')
      })

      test('creation fails if username length < 3', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'vo',
          password: 'abudacity'
        }

        const response = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length)

        expect(response.body.error).toBe('User validation failed: username: Path `username` (`vo`) is shorter than the minimum allowed length (3).')
      })
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})