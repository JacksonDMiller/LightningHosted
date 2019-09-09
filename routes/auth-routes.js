const router = require('express').Router();
const User = require('../models/user-model');
const crypto = require('crypto');
const grpc = require('grpc');
const fs = require('fs');
const qrCode = require('qrcode')

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
lightning = new lnrpc.Lightning('localhost:10009', credentials);

var call = lightning.subscribeInvoices({});

call.on('data', function (invoice) {
    if (invoice.settled === true) {
        User.findOne({ 'images.paymentRequest': invoice.payment_request }).then(function (record) {
            record.images.forEach(element => {
                if (element.paymentRequest === invoice.payment_request) {
                    console.log(element, 'elment')
                    element.payStatus = true;
                }
            })
            record.save();
        });

    }
})
    .on('end', function () {
        // The server has finished sendi
    })
    .on('status', function (status) {
        // Process status
        //  console.log("Current status" + status);
    });


// This checks to see if a user is logged in before allowing them to access a page.
const authCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        res.redirect('../noauth/google')
    }
    else {
        // if logged in
        next();
    }
};

router.get('/', authCheck, (req, res) => {
    res.render('profile', { user: req.user });
});

// REORGONZINGING THIS MOVING THE DATBASE CALL INSIDE THE LIGHTNING CALLBACK 
router.post('/upload', function (req, res) {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }
    lightning.addInvoice({ value: 250, memo: 'LightningHosted Captcha' }, function (err, response) {
        fileName = crypto.randomBytes(20).toString('hex')
        req.files.filepond.mv('./uploads/' + fileName + '.jpg', function (err) {
            if (err) { return res.status(500).send(err) };

            User.findOne({ _id: req.user.id }).then((currentUser) => {
                currentUser.images.push({
                    imageId: fileName,
                    reviewStatus: false,
                    payStatus: false,
                    deleted: false,
                    views: 0,
                    reports: 0,
                    fileName: fileName + '.jpg',
                    thumbNail: 'x',
                    width: 1,
                    height: 1,
                    date: new (Date),
                    title: '',
                    caption: 'String',
                    paymentRequest: response.payment_request,
                    upVotes: 0,
                    sats: 0,
                })
                currentUser.save().then(() => {
                    qrCode.toDataURL(response.payment_request, function (err, url) {
                        res.status(200).send({
                            invoice: response.payment_request,
                            image: url,
                            fileName: fileName + ".jpg",
                            id: currentUser.images[currentUser.images.length - 1].id
                        });
                    })

                });
            });
        });
    }
    );
});

router.get('/user', authCheck, (req, res) => {
    User.findOne({ _id: req.user.id }).then((currentUser) => {
        res.send(currentUser)
    })
});

router.get('/title/:id/:title', authCheck, (req, res) => {
    User.findOne({ 'images._id': req.params.id }).then((currentUser) => {
        currentUser.images.forEach(element => {
            if (element._id == req.params.id) {
                element.title = req.params.title;
            }
        })
        currentUser.save();
        res.send('Title Updated')
    })
});

router.get('/paymentStatus/:invoice', authCheck, (req,res) => {
    User.findOne({ 'images.paymentRequest': req.params.invoice }).then((currentUser) => {
        currentUser.images.forEach(element => {
            if (element.paymentRequest == req.params.invoice) {
                res.send(element)
                return
            }
        })
    })
})

router.get('/delete/:id/', authCheck, (req, res) => {
    console.log(req.params.id)
    User.findOne({ 'images._id': req.params.id }).then((currentUser) => {
        currentUser.images.forEach(element => {
            if (element._id == req.params.id) {
                element.deleted = true;
            }
        })
        currentUser.save();
        res.send('Image deleted')
    })
});


router.get('/withdraw/:invoice', authCheck, (req,res) => {
    lightning.DecodePayReq(req.params.invoice, function (decodeErr, decodeReesponse) {
        if(decodeErr){
            res.send(decodeErr.details)
        }
        else{
    console.log(decodeReesponse.num_satoshis,'  decode')
    console.log(req.user.earnedSats,'  earnedssats ')
    if(req.user.earnedSats >= decodeReesponse.num_satoshis){
        lightning.sendPaymentSync({ payment_request: req.params.invoice }, function (err, response) {
            if (err) {
              res.send(err.details);
            }
            else { 
              res.send({status:'success', amount: decodeReesponse.num_satoshis}); 
              req.user.earnedSats = req.user.earnedSats - decodeReesponse.num_satoshis;
              req.user.save();
            };
          })
    }
else {
    res.send('Not enough sats')
}}
});
});

module.exports = router;




// 

//   if (err) {
//     console.log(err);
//     res.send('Invalid Invoice');
//     return false;
//   }

//   User.findOne({AccountId: req.params.account}).then(function(record){

