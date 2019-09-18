const router = require('express').Router()
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Users = require('../users/usersHelper')
const restricted = require('./restricted')


router.post('/register', (req, res) =>
{
    if(!req.body.username || !req.body.password || !req.body.department)
    {
        res.status(400).json({ errorMessage: "Missing data for user" })
    }
    else
    {
        let user = req.body
        bcryptjs.genSalt(14, function(err, salt)
        {
            bcryptjs.hash(user.password, salt, function(err, hash)
            {
                user.password = hash
                Users.add(user)
                    .then(response =>
                        {
                            res.status(201).json({id: response.id, username: response.username, department: response.department})
                        })
                    .catch(error =>
                        {
                            res.status(500).json({ errorMessage: `Internal Error: Could not register user` })
                        })
            })
        })
    }
})

router.post('/login', (req, res) =>
{
    if(!req.body.username || !req.body.password)
    {
        res.status(400).json({ errorMessage: "Missing credentials" })
    }
    else
    {
        let {username} = req.body
        Users.findBy({ username })
            .first()
            .then(user =>
                {
                    if(user)
                    {
                        bcryptjs.compare(req.body.password, user.password, function(err, response)
                        {
                            if(response)
                            {
                                const token = generateToken(user)
                                res.status(200).json({token})
                            }
                            else res.status(401).json({ message: 'Invalid Credentials' })
                        })
                    }
                    else res.status(401).json({ message: 'Invalid Credentials' })
                })
            .catch(error =>
                {
                    res.status(500).json(error)
                })
    }
})

router.get('/users', restricted, (req, res) =>
{
    Users.find()
        .then(response =>
            {
                let deptUsers = response.filter(el => el.department === req.user.department)
                res.status(200).json(deptUsers)
            })
        .catch(error =>
            {
                res.status(500).json({ errorMessage: `Internal Error: Could not get ` })
            })
})

function generateToken(user)
{
    const payload = { username: user.username, department: user.department }
    const secret = require('../config/secret').jwtSecret
    const options = { expiresIn: '1d' }

    return jwt.sign(payload, secret, options)
}

module.exports = router