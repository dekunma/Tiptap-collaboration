const redis = require('../redis/redis');
const masxStoredSteps = 1000;
const { resolve } = require('path');

/**
 * get the 'steps' object of a document by id
 * @param {UUID} documentId the document id
 * @param {number} version the version number
 * @returns {array<object>} the 'steps' array
 */
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

/**
 * set the 'steps' record of a document
 * @param {UUID} documentId id of the document
 * @param {Object} steps the old steps object
 * @param {number} version version number
 * @returns none
 */
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

  await redis.hset(`steps.${documentId}`, 'data', JSON.stringify(newData));
  resolve()
}

/**
 * get the doc object of a documentId
 * @param {UUID} documentId the document id
 * @returns {object} the 'doc' object of a document
 */
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

/**
 * set the 'doc' object of a document by 'documentId'
 * @param {UUID} documentId the document id
 * @param {Object} newData new 'doc' data for the document
 * @returns none
 */
async function setDoc(documentId, newData) {
  return new Promise(async (resolve, reject) => {
    await redis.hset(`data.${documentId}`, 'data', JSON.stringify(newData));
    resolve()
  })
}

/**
 * check if a document is currently locked
 * @param {UUID} documentId the document id
 * @param {boolean} locked if the document is currently locked
 * @returns none
 */
async function setLocked(documentId, locked) {
  return new Promise(async (resolve, reject) => {
    let documentData = await getDoc(documentId);
    documentData.isLocked = locked;
    resolve()
  })
}

/**
 * get the lock status of a document
 * @param {UUID} documentId the document id
 * @returns {boolean} whether the document is locked
 */
async function getLocked(documentId) {
  return new Promise(async (resolve, reject) => {
    const documentData = await getDoc(documentId);
    if(documentData == null) resolve(null);
    else resolve(documentData.isLocked);
  })
}

module.exports = {
    setSteps,
    getDoc,
    setDoc,
    setLocked,
    getLocked,
    getSteps
}