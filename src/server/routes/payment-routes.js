const lnService = require('ln-service');
const keys = require('../config/keys')
const { lnd } = lnService.authenticatedLndGrpc(keys.lnd);

module.exports = function (app) {
    //pay an lnd invoice
    app.get('/api/payinvoice/:invoice', (req, res) => {
        lnService.pay({ lnd, request: req.params.invoice })
            .catch((err) => {
                console.log(err);
                res.send(err)
            })
    })


}