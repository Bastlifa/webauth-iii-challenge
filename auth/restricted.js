const jwt = require('jsonwebtoken')
const secret = require('../config/secret')

const Users = require('../users/usersHelper')

module.exports = (req, res, next) =>
{
    const token = req.headers.authorization
    if(token)
    {
        jwt.verify(token, secret.jwtSecret, (err, decodedToken) =>
        {
            if(err) res.status(401).json({ message: 'Invalid Credentials' })
            else
            {
                req.user = {username: decodedToken.username, department: decodedToken.department}
                console.log(req.user)
                next()
            }
        })
    }
    else res.status(400).json({ message: 'No credentials provided' })
}
