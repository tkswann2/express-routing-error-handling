'use strict'
const  bcrypt = require('bcrypt')
  ,      User = require('../models/user')


module.exports.new = (req,res) => {
  res.render('login', {title: 'Login', login: true})
}

module.exports.create = ({session, body: {email, password}},res,cb) => {
  User
    .findOne({email})
    .then(user => {
      if(user) {
        // if user exists, compare hashes, then either resolve or reject
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, matches) => {
              if (err) {
                reject(err)
              } else {
                resolve(matches)
              }
            })
          })
      } else {
        res.render('login', {error: 'Email does not exist in our system'})
      }
    })
    .then(matches => {
      // if user exists, and password matches, redirect to main page
      if(matches) {
        session.email = email
        res.redirect('/')
      } else {
        res.render('login', {error: 'Email &/or password does not match'})
      }
    })
    .catch(cb)
}
