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
                console.log('starting image proccessing')
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
            console.log('image has been proccesed')


            const getDimensions = new Promise(async (resolve, reject) => {
                console.log('getting dimensions')
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
            console.log(dimensions, 'got dimensions')


            const generateThumbnail = new Promise(async (resolve, reject) => {
                console.log('begining thumbnail creation')
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
            console.log('the thumbnail is done')




            await imageInvoice.then((invoice) => {
                imageInvoice = invoice;
                console.log(invoice)
            })
            let imageOrientation = 'horizontal'
            if (dimensions.height > dimensions.width) {
                imageOrientation = 'vertical';
            };

            imageData = {
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
            console.log(imageData)
            await req.user.images.push(imageData);
            req.user.save();

            res.send(imageData);
        }
        //there is a random false console log in this function no idea why
    })







    // adding invoice generation to this is very messy :( keep trying 

    // createInvoice({ lnd, description: 'LightningHosted deposit', tokens: '100', })
    //     .then((invoice) => {
    //         imageInvoice = invoice.request
    //         console.log(imageInvoice)
    //     })
    //handles the upload, compression, creation of thumbnail, and setting image info for a new image and creates a new database entry.
    app.post('/api/uploads', upload.single("filepond"), async function (req, res) {

        if (Object.keys(req.file).length === 0) {
            console.log('no files were uploaded')
            return res.status(400).send('No files were uploaded.');
        }
        else {
            var imageWidth = 0;
            var imageHeight = 0;
            var imageOrientation = 'horizontal';
            var imageExtension = 'jpeg';
            var imageFileName = crypto.randomBytes(8).toString('hex');
            var imageInvoice = await createInvoice({ lnd, description: 'LightningHosted deposit', tokens: '100', })
                .then((invoice) => {
                    imageInvoice = invoice.request
                    console.log(imageInvoice)
                });


            if (req.file.mimetype === 'image/gif') {
                imageExtension = 'gif'
                fs.copyFileSync(req.file.path, 'src/server/uploads/compressed/' + imageFileName + '.gif', makeThumbnail())
            }
            // it's not working because its and array of objects not an array 
            if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {
                sharp(req.file.path).jpeg({ quality: 75, force: true }).rotate().toFile('src/server/uploads/compressed/' + imageFileName + '.' + 'jpeg', function (err) {
                    if (err) {
                        // find a good way to do some error loggin here.
                        console.log(err);
                        res.status(500).send('Something went wrong.');
                    }
                    makeThumbnail();
                })
            }

            if (req.file.mimetype === 'video/mp4') {
                imageExtension = 'mp4'
                const tg = new ThumbnailGenerator({
                    sourcePath: req.file.path,
                    thumbnailPath: 'src/server/uploads/thumbnails/',
                });
                tg.generateOneByPercentCb(90, { size: imageWidth + 'x' + imageHeight }, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    }
                    sharp('src/server/uploads/thumbnails/' + result).jpeg({ quality: 80, force: true }).toFile('src/server/uploads/thumbnails/' + imageFileName + '.' + 'jpeg', function (err) {
                        if (err) {
                            console.log(err);
                            res.status(500).send(err);
                        }
                        fs.unlink('src/server/uploads/thumbnails/' + result, function (err) {
                            if (err) {
                                console.log(err);
                            };
                        });
                        fs.unlink('src/server/uploads/' + req.file.filename, function (err) {
                            if (err) {
                                console.log(err);
                            };
                        });

                        imageSize('src/server/uploads/thumbnails/' + imageFileName + '.jpeg', function (err, dimensions) {
                            if (err) {
                                console.log(err);
                                res.status(500).send(err);
                            }
                            imageWidth = dimensions.width;
                            imageHeight = dimensions.height;
                            if (imageHeight > imageWidth) {
                                imageOrientation = 'vertical';
                            };
                            addDatabaseRecord();
                        });


                    });
                });
                fs.copyFile(req.file.path, 'src/server/uploads/compressed/' + imageFileName + '.mp4', function (err) {
                    if (err) {
                        console.log(err);
                    };
                })
            }

            function makeThumbnail() {
                sharp(req.file.path).jpeg({ quality: 40, force: true }).rotate().toFile('src/server/uploads/thumbnails/' + imageFileName + '.' + 'jpeg', function (err) {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    }
                    imageSize('src/server/uploads/compressed/' + imageFileName + '.' + imageExtension, function (err, dimensions) {
                        if (err) {
                            res.status(500).send(err);
                        }
                        imageWidth = dimensions.width;
                        imageHeight = dimensions.height;
                        if (imageHeight > imageWidth) {
                            imageOrientation = 'vertical';
                        };
                        addDatabaseRecord();
                    });

                    fs.unlink('src/server/uploads/' + req.file.filename, function (err) {
                        if (err) {
                            console.log(err);
                        };
                    });
                })

            }

            function addDatabaseRecord() {

                imageData = {
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
                    width: imageWidth,
                    height: imageHeight,
                    date: new (Date),
                    title: '',
                    caption: '',
                    paymentRequest: imageInvoice,
                    upVotes: 0,
                    sats: 0,
                    numberOfComments: 0,
                    fileType: imageExtension,
                    ogType: 'ogType',
                    twitterCard: 'twitterCard',
                    suppressed: false,
                }
                console.log(imageData)
                req.user.images.push({ imageData }).then(() => req.user.save())

                res.send(imageData);
            }
        }
    });
}