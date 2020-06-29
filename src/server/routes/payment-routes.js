const keys = require('../config/keys')
const { pay, createInvoice, authenticatedLndGrpc, subscribeToInvoices } = require('ln-service');
const Users = require('../models/user-model');
const { lnd } = authenticatedLndGrpc(keys.lnd);

// const { once } = require('events');  might be unneeded
const sub = subscribeToInvoices({ lnd });


//listen for payments and mark invoices as paid in the database
sub.on('invoice_updated', async invoice => {
    if (invoice.is_confirmed === true) {
        const doc = await Users.findOne({ 'images.paymentRequest': invoice.request })
        const index = await doc.images.findIndex(image => image.paymentRequest === invoice.request)
        doc.images[index].payStatus = true;
        doc.save()
    }
})

// listenForInvoices()

module.exports = function (app) {
    //pay an lnd invoice
    app.get('/api/payinvoice/:invoice', async (req, res) => {
        try {
            const lndRes = await pay({ lnd, request: req.params.invoice })
            console.log(lndRes)
            res.send({ message: 'Paid!' })
        }
        catch (err) {
            res.send(err)
        }
    })

    app.get('/api/checkpayment/:invoice', async (req, res) => {
        const doc = await Users.findOne({ 'images.paymentRequest': req.params.invoice })
        const index = await doc.images.findIndex(image => image.paymentRequest === req.params.invoice)
        if (doc.images[index].payStatus === true) {
            res.send(doc.images[index].payStatus);
        }
        else { res.status(402).send() }

    })
}


