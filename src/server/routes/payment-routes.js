const keys = require('../config/keys')
const { pay, createInvoice, authenticatedLndGrpc, subscribeToInvoices } = require('ln-service');
const Users = require('../models/user-model');
const { lnd } = authenticatedLndGrpc(keys.lnd);

// const { once } = require('events');  might be unneeded
const sub = subscribeToInvoices({ lnd });


//listen for payments
sub.on('invoice_updated', async invoice => {
    // Only actively held invoices can be settled
    console.log(invoice.paymentRequest)
    Users.findOne({ 'invoice': invoice.paymentRequest })
        .then(doc => console.log(doc.images
            .find(({ paymentRequest }) => paymentRequest === invoice.paymentRequest)))
})

// listenForInvoices()

module.exports = function (app) {
    //pay an lnd invoice
    app.get('/api/payinvoice/:invoice', (req, res) => {
        pay({ lnd, request: req.params.invoice })
            .catch((err) => {
                console.log(err);
                res.send(err)
            })
    })

    app.get('/api/createinvoice', (req, res) => {
        createInvoice({ lnd, description: 'LightningHosted deposit', tokens: '100', }).then((invoice) => res.send(invoice)).catch(err => console.log(err))
    }
    )

}


