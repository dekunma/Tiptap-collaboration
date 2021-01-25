const express = require('express');
const router = express.Router();
const randomUUID = require('uuid-random');
const redis = require('../redis/redis')

// client sends a get request to create a new document
router.get('/', (req, res, next) => {
    const newCollaborationId = randomUUID();
    let newDocumentData = {
      version: 1,
      doc: {
        type: 'doc',
        content: [
          {
            type: "heading",
            content: [
              {
                "type": "text",
                "text": "Welcome to collaboration documents! 👏"
              },
            ]
          },
          {
            type: "heading",
            content: [
              {
                "type": "text",
                "text": "Start by typing or editing something"
              },
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
})

module.exports = router