const http = require('http');
const express = require('express');
const cors = require('cors')
const schema = require('./schema.js');
const { Step } = require('prosemirror-transform');


// config .env variabled
require('dotenv').config();

// create express server
const app = express();

// enable cors
app.use(cors())

// create http server
const server = http.createServer(app);

// create socket.io server
const io = require('socket.io')(server, {
  // we need to enable cors for socket.io individually
  cors: {
    origin: '*',
  }
});

// controllers
const newDocumentController = require('./controllers/newDocument')

// create new collaboration document
app.use('/new', newDocumentController)

// import utils for document
const { 
  setSteps,
  getDoc,
  setDoc,
  setLocked,
  getLocked,
  getSteps
 } = require('./utils/documentUtils')

 // socket io
io.on('connection', async (socket) => {
  const documentId = socket.request._query.id;

  socket.join(documentId)

  const data = await getDoc(documentId);
  io.to(documentId).emit('init', data)

  socket.on('update', async ({ version, clientID, steps }) => {
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
      // socket.emit('update', newData)
      io.to(documentId).emit('update', newData);
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
    io.to(documentId).emit('update', dataToEmit)
    await setLocked(documentId, false)
  })

  // send client count
  io.sockets.emit('getCount', io.sockets.adapter.rooms.get(documentId).size)
  socket.on('disconnect', () => {
    io.sockets.emit('getCount', io.sockets.adapter.rooms.get(documentId) === undefined ? 0 : io.sockets.adapter.rooms.get(documentId).size)
  })

})

// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));