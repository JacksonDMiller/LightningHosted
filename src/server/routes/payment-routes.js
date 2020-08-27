const keys = require('../config/keys')
const { pay, createInvoice, authenticatedLndGrpc,
    subscribeToInvoices, decodePaymentRequest } = require('ln-service');
const Users = require('../models/user-model');
const { lnd } = authenticatedLndGrpc(keys.lnd);
const sub = subscribeToInvoices({ lnd });
const logger = require('winston')


//listen for payments and mark invoices as paid in the database
sub.on('invoice_updated', async invoice => {
    if (invoice.is_confirmed === true) {
        const doc = await Users.findOne({ 'images.paymentRequest': invoice.request })
        const index = await doc.images.findIndex(image => image.paymentRequest === invoice.request)
        doc.images[index].payStatus = true;
        doc.save()
    }
})

module.exports = function (app) {
    //pay a lightning invoice if the user has earned enough sats.
    app.post('/api/payinvoice/', async (req, res) => {
        try {
            const details = await decodePaymentRequest({ lnd, request: req.body.invoice });
            if (req.user.sats >= details.tokens) {
                const lndRes = await pay({ lnd, request: req.body.invoice })
                // update the users balance
                req.user.sats = req.user.sats - details.tokens;
                req.user.paidSats = req.user.paidSats + details.tokens;
                req.user.save();
                res.send({ message: 'Paid!', user: req.user })
            }
            else { res.status(400).send({ error: `You don't have enough sats` }) }
        }
        catch (err) {
            console.log(err)
            res.send({ error: 'Oops something went wrong please try again' })
        }
    })

    // calling this with undefined crashes the whole server... 
    // check if a payment has been made
    app.get('/api/checkpayment/:invoice', async (req, res) => {
        if (req.params.invoice) {
            try {
                // look for the user assinged to the payment request in the database
                const doc = await Users.findOne({ 'images.paymentRequest': req.params.invoice })
                if (doc) {
                    // find the image assigned to the payment request in the user record
                    const index = await doc.images.findIndex(image => image.paymentRequest === req.params.invoice)
                    if (doc.images[index].payStatus === true) {
                        res.status(200).send({ payStatus: true, imageData: doc.images[index] });
                    }
                    else { res.status(402).send({ error: 'Payment Required' }) }
                }
            }
            catch (err) {
                logger.log({
                    level: 'error',
                    message: 'Payment checking error',
                    error: err
                })
                res.status(400).send({ error: 'oops something went wrong' })
            }
        }
        else {
            res.status(400).send({ error: 'oops something went wrong' })
        }
    })
}



