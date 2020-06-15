const Users = require('../models/user-model');

// a list of the top 100 images
var topPostsList = [];
var f = [];

//refreshing the top posts list periodically
setInterval(function () {
    // console.log('top ten updated');
    updateTopTenList();
}, 1000);

updateTopTenList = () => {
    topPostsList = [];
    Users.find({}).lean().then(function (record) {
        record.forEach(element => {
            //sort the images here
            for (image in element.images) {
                if (element.images[image].deleted !== true && element.images[image].suppressed !== true) {
                    topPostsList.push(element.images[image])
                }
            }

        });
    })

}
// initail server start update 
updateTopTenList();


module.exports = function (app) {


    // get an image from the server  i = image
    app.get('/api/i/:fileName', (req, res) => {
        res.sendFile('/src/server/uploads/compressed/' + req.params.fileName, { root: './' });
    });

    // get a thumbnail from the server  t = thumbnail
    app.get('/api/t/:fileName', (req, res) => {
        res.sendFile('/src/server/uploads/thumbnails/' + req.params.fileName, { root: './' });
    });

    // get an image's record from the DB ii = image info
    app.get('/api/ii/:imageId', (req, res) => {
        Users.findOne({ 'images.imageId': req.params.imageId }).then((user, err) => {
            if (err) { res.send('oops') }
            for (n in user.images) {
                if (user.images[n].imageId === req.params.imageId) {
                    res.send(user.images[n])
                    break;
                }
            }
        }).catch(err => {
            res.send("We couldn't find that image")
        })
    });

    // get the top ten images tt = top ten
    app.get('/api/tt/:page', (req, res) => {
        let start = 0 + (req.params.page * 10)
        let end = 15 + (req.params.page * 10)
        res.send(topPostsList.slice(start, end))
    })

}