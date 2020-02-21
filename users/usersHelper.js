const db = require('../database/dbConfig')

module.exports =
{
    find,
    findBy,
    findbyId,
    add
}

function find()
{
    return db('users').select('id', 'username', 'department')
}

function findBy(filter)
{
    return db('users').where(filter)
}

async function add(user)
{
    const [id] = await db('users').insert(user)
    return findbyId(id)
}

function findbyId(id) { return db('users').where({id}).first() }