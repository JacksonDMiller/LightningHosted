
const Users = require('../models/user-model');
const fsPromises = require('fs').promises;
const logger = require('winston')


module.exports = function (app) {

    app.get('/api/moderatordeleteimage/:imageId', async (req, res) => {
        if (req.user.moderator) {
            try {
                let doc = await Users.findOne({ 'images.imageId': req.params.imageId })
                const index = await doc.images
                    .findIndex(image => image.imageId === req.params.imageId);
                doc.images[index].deleted = true;
                fsPromises.unlink('src/server/uploads/compressed/' + doc.images[index].fileName);
                fsPromises.unlink('src/server/uploads/thumbnails/' + doc.images[index].thumbNail);

                doc.save();
                res.status(200).send({ message: 'deleted' });
            }
            catch (error) {
                logger.log({
                    level: 'error',
                    message: `Moderator Delete image Error` + error
                })
                res.status(404).send(`Oops something went wrong`)
            }
        }
        else {
            res.status(401).send({ error: `cheeky bastard` })
        }
    });

    app.get('/api/moderatorsuppressimage/:imageId', async (req, res) => {
        if (req.user.moderator) {
            try {
                let doc = await Users.findOne({ 'images.imageId': req.params.imageId })
                const index = await doc.images
                    .findIndex(image => image.imageId === req.params.imageId);
                doc.images[index].suppressed = true;
                doc.save();
                res.status(200).send({ message: 'deleted' });
            }
            catch (error) {
                logger.log({
                    level: 'error',
                    message: `moderator supress image Error` + error
                })
                res.status(404).send(`Oops something went wrong`)
            }
        }
        else {
            res.status(401).send({ error: `cheeky bastard` })
        }
    });

    app.get('/api/moderatorsuppresscomment/:commentId/:imageId', async (req, res) => {
        if (req.user.moderator) {
            try {
                let doc = await Users.findOne({ 'images.imageId': req.params.imageId })
                const index = await doc.images
                    .findIndex(image => image.imageId === req.params.imageId);

                const commentIndex = await doc.images[index].comments
                    .findIndex(comment => comment.commentId === req.params.commentId);
                doc.images[index].comments[commentIndex].suppressed = true;
                doc.save();
                res.status(200).send({ message: 'supressed' });
            }
            catch (error) {
                logger.log({
                    level: 'error',
                    message: `Moderator Delete comment Error` + error
                })
                res.status(404).send(`Oops something went wrong`)
            }
        }
        else {
            res.status(401).send({ error: `cheeky bastard` })
        }
    });
}