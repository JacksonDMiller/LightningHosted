const Users = require('../models/user-model');
var multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const imageSize = require('image-size');
const ThumbnailGenerator = require('video-thumbnail-generator').default;
const { createInvoice, authenticatedLndGrpc } = require('ln-service');
const keys = require('../config/keys')
const { lnd } = authenticatedLndGrpc(keys.lnd);
const fsPromises = require('fs').promises;
const getVideoDimensions = require('get-video-dimensions');



//seting up multer
const acceptedMimeTypes = ["image/jpeg", "video/mp4", "image/gif", "image/png"]
var upload = multer({
    dest: 'src/server/uploads/compressed',
    // filter uploaded files using molter
    fileFilter: function fileFilter(req, file, cb) {
        let error = null;
        if (!req.user) {
            error = 'Please log in first';
        }
        if (!acceptedMimeTypes.includes(file.mimetype)) {
            error = 'Unsported file type';
        }
        if (error) {
            // console.log('Rejected');

            cb(error, false);
        }
        else {
            cb(null, true);
        }
        // The function should call `cb` with a boolean
        // to indicate if the file should be accepted

        // To reject this file pass `false`, like so:
        // cb(null, false)

        // To accept the file pass `true`, like so:
        // cb(null, true)

        // You can always pass an error if something goes wrong:
        // cb(new Error('I don\'t have a clue!'))

    },
})


module.exports = function (app) {


    app.post('/api/upload', upload.single("filepond"), async function (req, res) {
        if (Object.keys(req.file).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        else {
            var imageFileName = crypto.randomBytes(8).toString('hex')
            var imageExtension = ''
            var imageInvoice = createInvoice({ lnd, description: 'LightningHosted deposit', tokens: '100' })

            const processedImage = new Promise(async (resolve, reject) => {
                // console.log('starting image proccessing')
                //this error hanlding does not work :( try to fix it
                if (req.file.mimetype === 'image/gif') {
                    await fsPromises.rename(req.file.path, 'src/server/uploads/compressed/' + imageFileName + '.gif')
                    resolve('gif')
                }

                if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {
                    await sharp(req.file.path).jpeg({ quality: 75, force: true })
                        .rotate()
                        .toFile('src/server/uploads/compressed/' + imageFileName + '.' + 'jpeg')
                    fsPromises.unlink(req.file.path);
                    resolve('jpeg')
                }

                if (req.file.mimetype === 'video/mp4') {
                    await fsPromises.rename(req.file.path, 'src/server/uploads/compressed/' + imageFileName + '.mp4')
                    resolve('mp4')
                }

            })
            await processedImage.then(ext => imageExtension = ext).catch((err) => console.log(err));
            // console.log('image has been proccesed')


            const getDimensions = new Promise(async (resolve, reject) => {
                // console.log('getting dimensions')
                if (imageExtension === 'mp4') {
                    result = await getVideoDimensions('src/server/uploads/compressed/' + imageFileName + '.mp4')
                    resolve(result)

                }
                else {
                    result = await imageSize('src/server/uploads/compressed/' + imageFileName + '.' + imageExtension)
                    resolve(result)
                }

            })

            var dimensions = await getDimensions.then((d) => dimensions = d);
            // console.log(dimensions, 'got dimensions')


            const generateThumbnail = new Promise(async (resolve, reject) => {
                // console.log('begining thumbnail creation')
                if (imageExtension === 'mp4') {
                    const tg = new ThumbnailGenerator({
                        sourcePath: 'src/server/uploads/compressed/' + imageFileName + '.mp4',
                        thumbnailPath: 'src/server/uploads/thumbnails/',
                    });
                    let result = await tg.generateOneByPercent(1, { size: dimensions.width + 'x' + dimensions.height })
                    await sharp('src/server/uploads/thumbnails/' + result).jpeg({ quality: 80, force: true }).toFile('src/server/uploads/thumbnails/' + imageFileName + '.' + 'jpeg')
                    fsPromises.unlink('src/server/uploads/thumbnails/' + result)
                    resolve(true)
                }
                else {
                    await sharp('src/server/uploads/compressed/' + imageFileName + '.' + imageExtension)
                        .jpeg({ quality: 40, force: true })
                        .rotate()
                        .toFile('src/server/uploads/thumbnails/' + imageFileName + '.' + 'jpeg')
                    resolve("true")
                }
            })


            await generateThumbnail
            // console.log('the thumbnail is done')




            await imageInvoice.then((invoice) => {
                imageInvoice = invoice;
                // console.log(invoice)
            })
            let imageOrientation = 'horizontal'
            if (dimensions.height > dimensions.width) {
                imageOrientation = 'vertical';
            };

            imageData = {
                recentViews: [],
                posterId: req.user._id,
                orientation: imageOrientation,
                imageId: imageFileName,
                reviewStatus: false,
                payStatus: false,
                deleted: false,
                views: 0,
                reports: 0,
                fileName: imageFileName + '.' + imageExtension,
                thumbNail: imageFileName + '.jpeg',
                width: dimensions.width,
                height: dimensions.height,
                date: new (Date),
                title: '',
                caption: '',
                paymentRequest: imageInvoice.request,
                upVotes: 0,
                sats: 0,
                numberOfComments: 0,
                fileType: imageExtension,
                ogType: 'ogType',
                twitterCard: 'twitterCard',
                suppressed: false,
            }
            // console.log(imageData)
            await req.user.images.push(imageData);
            req.user.save();

            res.send(imageData);
        }
        //there is a random false console log in this function no idea why
    })

    // photo information change this name
    app.get('/api/pi/', (req, res) => {
        if (req.user) {
            Users.findById(req.user._id).then((doc) => {
                res.send(doc)
            })
        }
        else {
            res.status(401).send()
        }
    })

    app.get('/api/upvote/:imageId', async (req, res) => {

        if (req.user) {
            const doc = await Users.findOne({ 'images.imageId': req.params.imageId })

            const index = await doc.images.findIndex(image => image.imageId === req.params.imageId)
            doc.images[index].upVotes = doc.images[index].upVotes + 1;
            doc.save()
            res.send({ message: 'ok' })
        }
        else {
            res.send('please login')
        }
    })

    app.get('/api/report/:imageId', async (req, res) => {
        if (req.user) {
            const doc = await Users.findOne({ 'images.imageId': req.params.imageId })
            const index = await doc.images.findIndex(image => image.imageId === req.params.imageId)
            doc.images[index].reports = doc.images[index].reports + 1;
            console.log(index)
            doc.save()
            res.send({ message: 'ok' })
        }
        else {
            res.send('please login')
        }
    })

    app.post('/api/newcomment', async (req, res) => {
        if (req.user) {
            console.log(req.body)
            res.send({ message: 'ok' })
        }
        else {
            res.send('please login')
        }
    })
}