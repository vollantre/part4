const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (req, res, next) => {
  try {
    const { body } = req
    const user = await User.findOne({ username: body.username })

    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash)

    if (!(user && passwordCorrect)) {
      return res.status(401).json({ error: 'invalid username or password' })
    }

    const userForToken = {
      username: user.username,
      id: user._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET)

    res.send({ token, username: user.username, name: user.name })

  } catch (e) {
    next(e)
  }
})

module.exports = loginRouter