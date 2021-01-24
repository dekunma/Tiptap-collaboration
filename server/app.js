const http = require('http');
const express = require('express');
const Redis = require("ioredis");
const cors = require('cors')
const randomUUID = require('uuid-random');
const { resolve } = require('path');
const schema = require('./schema.js');
const { Step } = require('prosemirror-transform');


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

// create http server
const server = http.createServer(app);

// create redis client
redis.on('connect', () => console.log('Connected to Redis'))

// create socket.io server
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

// create new collaboration document
app.get('/new', (req, res, next) => {
    const newCollaborationId = randomUUID();

    let newDocumentData = {
      version: 1,
      doc: {
        type: 'doc',
        content: [
          {
            type: "paragraph",
            content: [
              {
                "type": "text",
                "text": "Welcome to collaboration documents!"
              }
            ]
          },
        ]
      }
    }

    let newStepsDataJson = JSON.stringify([])
    let newDocumentDataJson = JSON.stringify(newDocumentData);

    redis.hset(`data.${newCollaborationId}`, 'data', newDocumentDataJson)
    .then(() => {
      redis.hset(`steps.${newCollaborationId}`, 'data', newStepsDataJson)
    })
    .then(() => res.send(newCollaborationId))
    .catch(e => res.status(500).send(e))
    // redis.smembers(key).then(r => {
    //   console.log(r)
    //   result = []
    //   for (ii of r) {
    //     result.push(JSON.parse(ii))
    //   }
    //   res.json(result)
    // })
})

const masxStoredSteps = 1000;

// set the steps data of a file
async function setSteps(documentId, {steps, version}) {
  const oldDataString = await redis.hget(`steps.${documentId}`, 'data');

  const oldData = oldDataString == null ? [] : JSON.parse(oldDataString);
  const limitedOldData = oldData.slice(Math.max(oldData.length - masxStoredSteps));

  const newData = [
    ...limitedOldData,
    ...steps.map((step, index) => {
      return {
        step: JSON.parse(JSON.stringify(step)),
        version: version + index + 1,
        clientID: step.clientID
      }
    })
  ]

  const result = await redis.hset(`steps.${documentId}`, 'data', JSON.stringify(newData));
  resolve()
}

async function getDoc(documentId) {
  return new Promise((resolve, reject) => {
    redis.hget(`data.${documentId}`, 'data')
    .then(dataString => {
      if (dataString === '') resolve(null);
      else resolve(JSON.parse(dataString));
    })
    .catch(err => reject(err))
  })
}

async function setDoc(documentId, newData) {
  return new Promise(async (resolve, reject) => {
    await redis.hset(`data.${documentId}`, 'data', JSON.stringify(newData));
    resolve()
  })
}

// set the lock state of a file
async function setLocked(documentId, locked) {
  return new Promise(async (resolve, reject) => {
    let documentData = await getDoc(documentId);
    documentData.isLocked = locked;
    resolve()
  })
}

// get the lock state of a file
async function getLocked(documentId) {
  return new Promise(async (resolve, reject) => {
    const documentData = await getDoc(documentId);
    if(documentData == null) resolve(null);
    else resolve(documentData.isLocked);
  })
}

// get the steps data of a file
async function getSteps(documentId, version) {
  return new Promise(async (resolve, reject) => {
    const stepsString = await redis.hget(`steps.${documentId}`, 'data');
    if (stepsString === '') resolve(null)
    try {
      const steps = JSON.parse(stepsString);
      resolve(steps.filter(step => step.version > version))
    }
    catch(e) {
      resolve([])
    }
  })
}

io.on('connection', async (socket) => {
  // console.log(socket.handshake.query)
  // socket.on('update', async ({}))


  const documentId = socket.request._query.id;
  socket.on('test', r => {
    console.log(r)
    // socket.emit('test', 'test')
  })

  // socket.on('id', async (id) => {
  //   documentId = id
  //   const data = await getDoc(id);
  //   socket.emit('init', data)
  // })

  const data = await getDoc(documentId);
  socket.emit('init', data)

  socket.on('update', async ({ version, clientID, steps }) => {
    console.log('update, documentId: ', documentId)
    // we need to check if there is another update processed
    // so we store a "locked" state
    const locked = await getLocked(documentId);

    if (locked) {
      // we will do nothing and wait for another client update
      return;
    }

    await setLocked(documentId, true);

    const storedData = await getDoc(documentId);

    // version mismatch: the stored version is newer
    // so we send all steps of this version back to the user
    if (storedData.version !== version) {
      const newData = {
        version,
        steps: await getSteps(documentId, version),
      }
      socket.emit('update', newData)
      console.log('s,', newData)
      await setLocked(documentId, false);
      return;
    }

    let doc = schema.nodeFromJSON(storedData.doc)

    let newSteps = steps.map(step => {
      const newStep = Step.fromJSON(schema, step);
      newStep.clientID = clientID;

      // apply step to document
      let result = newStep.apply(doc);
      doc = result.doc;

      return newStep;
    })

    // calculating a new version number is easy
    const newVersion = version + newSteps.length


    // store data


    await setSteps(documentId, {version, steps:newSteps})
    await setDoc(documentId, { version: newVersion, doc })

    const dataToEmit = {
      version: newVersion,
      steps: await getSteps(documentId, version),
    }

    // send update to everyone (me and others)
    io.sockets.emit('update', dataToEmit)

    console.log('d, ', dataToEmit)

    await setLocked(documentId, false)
  })

})



// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));