const router = require('express').Router();
const User = require('../models/user-model');
const crypto = require('crypto');
const grpc = require('grpc');
const fs = require('fs');
const qrCode = require('qrcode')
var sizeOf = require('image-size');
const sharp = require('sharp');

// Checks to see if a user is logged in before allowing them to access a page.
const authCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        res.redirect('../noauth/login')
    }
    else {
        // if logged in
        next();
    }
};

// setting up LND
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
var m = fs.readFileSync('./config/admin.macaroon');
var macaroon = m.toString('hex');

// build meta data credentials
var metadata = new grpc.Metadata();
metadata.add('macaroon', macaroon);
var macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
    callback(null, metadata);
});

// build ssl credentials using the cert the same as before
var lndCert = fs.readFileSync("./config/tls.cert");
var sslCreds = grpc.credentials.createSsl(lndCert);

// combine the cert credentials and the macaroon auth credentials
var credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

// Pass the crendentials when creating a channel
var lnrpcDescriptor = grpc.load("./config/rpc.proto");
var lnrpc = lnrpcDescriptor.lnrpc;

// Testing
var lightning = new lnrpc.Lightning('bitcoinacolyte.hopto.org:10009', credentials);
//   lightning = new lnrpc.Lightning('localhost:10009', credentials);

var call = lightning.subscribeInvoices({});

call.on('data', function (invoice) {
    if (invoice.settled === true) {
        User.findOne({ 'images.paymentRequest': invoice.payment_request }).then(function (record) {
            record.images.forEach(element => {
                if (element.paymentRequest === invoice.payment_request) {
                    element.payStatus = true;
                }
            })
            record.save();
        });

    }
})

router.get('/', authCheck, (req, res) => {
    res.render('profile', { user: req.user });
});

// Handles the upload and creation of a new image.
router.post('/upload', function (req, res) {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }
    lightning.addInvoice({ value: 250, memo: 'LightningHosted Captcha' }, function (err, response) {
        if(err){res.status(500).send(err)}
        var extension = req.files.filepond.name.split('.')[1]
        fileName = crypto.randomBytes(8).toString('hex')
        if (req.files.filepond.mimetype != 'image/gif') {
            req.files.filepond.mv('./uploads/' + fileName + 'temp' + '.' + extension, function (err) {
                if(err){
                    res.status(500).send(err)
                }
                sharp('./uploads/' + fileName + 'temp' + '.' + extension).jpeg({quality: 100,force: true}).rotate().toFile('./uploads/' + fileName + '.' + 'jpeg', function (err) {
                    if (err) { return res.status(500).send(err) };
                    createImage('jpeg',req,response)
                    fs.copyFile('./uploads/' + fileName + '.jpeg', './thumbnails/'+fileName + 'temp.jpeg', (err) => {
                        if (err) throw err;
                        sharp('./thumbnails/'+fileName+'temp.jpeg').jpeg({quality:40,force: true}).toFile('./thumbnails/'+fileName+'.jpeg',function (err) {
                            fs.unlink('./thumbnails/'+fileName+'temp.jpeg')
                            if(err){console.log(err)}})
                      });
                });
            })
        }
        else {
            req.files.filepond.mv('./uploads/' + fileName + '.' + extension, function (err) {
                if(err){res.status(500).send(err)}
                createImage(extension,req,response)
                fs.copyFile('./uploads/' + fileName + '.' + extension, './thumbnails/'+fileName + '.' + extension, (err) => {
                    if (err) throw err;
                  });
            })
        }
    })

    function createImage(extension,req,response) {
        sizeOf('./uploads/' + fileName + '.' + extension, function (err, dimensions) {
            req.user.images.push({
                imageId: fileName,
                reviewStatus: false,
                // payStatus: false,
                payStatus: true, //testing
                deleted: false,
                views: 0,
                reports: 0,
                fileName: fileName + '.' + extension,
                thumbNail: 'x',
                width: dimensions.width,
                height: dimensions.height,
                date: new (Date),
                title: '',
                caption: 'String',
                paymentRequest: response.payment_request,
                upVotes: 0,
                sats: 0,
            })
            req.user.save().then(() => {
                qrCode.toDataURL(response.payment_request, function (err, url) {
                    res.status(200).send({
                        invoice: response.payment_request,
                        image: url,
                        fileName: fileName + "." + extension,
                        imageId: fileName
                    });
                })

            });
        });
    }
});

router.get('/user', authCheck, (req, res) => {
    User.findOne({ _id: req.user.id }).then((currentUser) => {
        res.send(currentUser)
    })
});

router.get('/title/:imageId/:title', authCheck, (req, res) => {
    req.params.title = req.params.title.replace(/[&\/\\#,+()$~%'":*<>{}]/g, ''
    );
    req.user.images.forEach(element => {
        if (element.imageId == req.params.imageId) {
            element.title = req.params.title;
        }
    });
    req.user.save();
    res.send('Title Updated')
});

router.get('/paymentStatus/:invoice', authCheck, (req, res) => {
    req.user.images.forEach(element => {
        if (element.paymentRequest == req.params.invoice) {
            res.send(element)
            return
        }
    })
})

router.get('/delete/:id/', authCheck, (req, res) => {
    req.user.images.forEach(element => {
        if (element.imageId == req.params.id) {
            element.deleted = true;
        }
    })
    req.user.save();
    res.send('Image deleted')
});


router.get('/withdraw/:invoice', authCheck, (req, res) => {
    lightning.DecodePayReq(req.params.invoice, function (decodeErr, decodeReesponse) {
        if (decodeErr) {
            res.send(decodeErr.details)
        }
        else {
            if (req.user.sats >= decodeReesponse.num_satoshis) {
                lightning.sendPaymentSync({ payment_request: req.params.invoice }, function (err, response) {
                    if (err) {
                        res.send(err.details);
                    }
                    if (response.payment_error) {
                        res.send(response.payment_error);
                    }
                    else {
                        res.send({ status: 'success', amount: decodeReesponse.num_satoshis });
                        req.user.sats = req.user.sats - decodeReesponse.num_satoshis;
                        req.user.paidSats = req.user.paidSats + decodeReesponse.num_satoshis;
                        req.user.save();
                    };
                })
            }
            else {
                res.send('Not enough sats')
            }
        }
    });
});

module.exports = router;

