const Users = require('../models/user-model');
var multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const imageSize = require('image-size');
const ThumbnailGenerator = require('video-thumbnail-generator').default;

const fs = require('fs');


//seting up multer
var upload = multer({
    dest: 'src/server/uploads/',
    // filter uploaded files using molter
    fileFilter: function fileFilter(req, file, cb) {
        const acceptedMimeTypes = ["image/jpeg", "video/mp4", "image/gif", "image/png"]
        console.log(file.mimetype)
        if (acceptedMimeTypes.includes(file.mimetype) && req.user) {
            console.log('accepted')
            //accept
            cb(null, true)
        }
        else {
            //reject
            console.log('rejected!!')

            cb('Error: Unsported file type', false)
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




    app.post("/api/uploads", upload.single("filepond"), function (req, res, next) {
        // req.filess is array of `photos` files
        // console.log(req.filess);
        // req.body will contain the text fields, if there were any
        // console.log(req.body);
        res.send([req.file.filename]);
    });

    //handles the upload, compression, creation of thumbnail, and setting image info for a new image and creates a new database entry.
    app.post('/api/upload', upload.single("filepond"), function (req, res, next) {
        if (err instanceof multer.MulterError) {
            console.log(err)
            res.status(500).send(err);
        }
        if (!req.user) {
            return res.status(400).send('Please login first')
        }
        if (Object.keys(req.file).length === 0) {
            console.log('no files were uploaded')
            return res.status(400).send('No files were uploaded.');
        }

        var imageWidth = 0;
        var imageHeight = 0;
        var imageOrientation = 'horizontal'
        var imageExtension = 'jpeg'
        var imageFileName = crypto.randomBytes(8).toString('hex');


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

            req.user.images.push({
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
                paymentRequest: 0,
                upVotes: 0,
                sats: 0,
                numberOfComments: 0,
                fileType: imageExtension,
                ogType: 'ogType',
                twitterCard: 'twitterCard',
                suppressed: false,
            })
            req.user.save()
            res.send([req.file.filename]);
        }
    });
}