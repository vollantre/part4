const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs.map(b => b.toJSON()))
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id).populate('user')
    if (blog) {
      response.json(blog.toJSON())
    } else {
      response.status(404).end()
    }
  } catch (e) {
    next(e)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  try {
    const blog = new Blog(request.body)   
    if(blog.title && blog.url){
      if(!blog.likes) blog.likes = 0

      const decodedToken = jwt.verify(request.token, process.env.SECRET)
      if (!request.token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
      }

      const user = await User.findById(decodedToken.id)

      blog.user = user._id
      user.blogs = user.blogs.concat(blog)

      await user.save()
      const result = await blog.save()
      response.status(201).json(result.toJSON())
    } else {
      return response.status(400).end()
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    const blogId = req.params.id
    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    const blog = await Blog.findById(blogId)
    if (blog.user.toString() === decodedToken.id.toString()) {
      blog.remove()
      return res.status(204).end()
    }
    
    res.status(401).json({ error: 'token missing or wrong' })
  } catch (e) {
    next(e)
  }
})

blogsRouter.put('/:id', async (req, res, next) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updatedBlog.toJSON())
  } catch (e) {
    next(e)
  }
})

module.exports = blogsRouter
