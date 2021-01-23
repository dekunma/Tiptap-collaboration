const http = require('http');
const express = require('express');
const Redis = require("ioredis");
const cors = require('cors')

const randomUUID = require('uuid-random');

// config .env variabled
require('dotenv').config();

const redis = new Redis({
  port: process.env.redisPort,
  host: process.env.redisEndpoint,
});

// create express server
const app = express();

// enable cors
app.use(cors())

const server = http.createServer(app);



// create redis client
redis.on('connect', () => console.log('Connected to Redis'))

app.get('/new', (req, res, next) => {
    const newCollaborationId = randomUUID();
    res.send(newCollaborationId);
    const key = 'idRepo';
    redis.sadd(key, newCollaborationId)
    redis.smembers(key).then(r => console.log(r))
})

// const w = 'w'
// redis.hset('test', `student.${w}`, 'w')
// redis.hset('test', 'student.v', 'v')
// redis.hgetall('test')
// .then(r => console.log(r))


// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));