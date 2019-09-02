const router = require('express').Router();
const User = require('../models/user-model');
const crypto = require('crypto');
const grpc = require('grpc');
const fs = require('fs');

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
    // searches pending for incoming invoices
    if (invoice.settled === true) {
        pending[invoice.payment_request] = true;
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
var invoice = '';
router.post('/upload', function (req, res) {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }
    
    lightning.addInvoice({ value: 250, memo: 'LightningHosted Captcha' }, function (err, response) {
        invoice = response.payment_request;
    }
    );

    let newImage = req.files.filepond;

    fileName = crypto.randomBytes(20).toString('hex')
    // use the mv() method to place the file somewhere on your server
    newImage.mv('./uploads/' + fileName + '.jpg', function (err) {
        if (err) { return res.status(500).send(err) };

        User.findOne({ _id: req.user.id }).then((currentUser) => {
            currentUser.images.push({
                imageId: fileName,
                reviewStatus: false,
                deleted: false,
                views: 0,
                reports: 0,
                fileName: fileName + '.jpg',
                thumbNail: 'x',
                width: 1,
                height: 1,
                date: new (Date),
                title: 'ss',
                caption: 'String',
                paymentRequest: invoice,
                upVotes: 0
            })
            currentUser.save();
        });
        res.status(200).send(invoice);
    });
});

router.get('/user', authCheck, (req, res) => {
    User.findOne({ _id: req.user.id }).then((currentUser) => {
        res.send(currentUser)
    })
});


module.exports = router;


// lightning.addInvoice({ value: 250, memo: 'LightningHosted Captcha' }, function (err, response) {
//   pending[response.payment_request] = false;
//   var x = {};
//   QRCode.toDataURL(response.payment_request, function (err, url) {
//     x.image = url;
//     x.text = response.payment_request;
//     res.send(x);
//   });
// }
// );

// lightning.DecodePayReq(req.params.lninvoice, function (err, response) {

//   if (err) {
//     console.log(err);
//     res.send('Invalid Invoice');
//     return false;
//   }

//   User.findOne({AccountId: req.params.account}).then(function(record){



//   if (response.num_satoshis <= record.Satoshis) {
//     response.num_satoshis = parseInt(response.num_satoshis);
//     record.Satoshis -= response.num_satoshis;
//     record.Paid += response.num_satoshis;
//     record.save();

//     lightning.sendPaymentSync({ payment_request: req.params.lninvoice }, function (err, response) {
//       if (err) {
//         res.send('error');
//       }
//       else { 
//         res.send('success'); 
//       };
//     })
//   }
//   else { 
//     res.send('Not enough funds');
//  };
// });
// });