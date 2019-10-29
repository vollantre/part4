const bcrypt = require('bcrypt')
const User = require('../models/user')
const usersRouter = require('express').Router()

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs')
  res.json(users.map(u => u.toJSON()))
})

usersRouter.post('/', async (req, res, next) => {
  try {
    const { body } = req
    if (body.password.length < 3) {
      return res.status(400).json({ error: 'password too short' })
    }

    const passwordHash = await bcrypt.hash(body.password, 10)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    })

    await user.save()

    res.json(user)
  } catch(e) {
    next(e)
  }
})

module.exports = usersRouter