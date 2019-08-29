const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user-model');

// auth logout
router.get('/logout', (req,res) => {
    // handle with passport
    req.logout();
    res.redirect('../');
});

// auth with google
router.get('/google', passport.authenticate('google',{
scope:['profile']
}));

//callback route for google to redirect to

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/auth/');
});

router.get('/topPosts/:page', (req,res) =>{
    User.find({}).lean().then(function(record){
        topPostsList = []
        record.forEach(element => {
          for(image in element.images){
            if ( element.images[image].deleted != true){
            let x = {}
            x.imageId =  element.images[image].imageId
            x.fileName = element.images[image].fileName
            x.views = element.images[image].views 
            x.title= element.images[image].title
            x.caption = element.images[image].caption
            x.height = element.images[image].height
            x.width = element.images[image].width
            topPostsList.push(x)}
          }
    
        });
        topPostsList.sort(function (a, b) { return parseFloat(b.views) - parseFloat(a.views) })
        var slicedTopPostList = topPostsList.slice((req.params.page-1)*10,req.params.page*10)
        res.send(slicedTopPostList)
    });
});

router.get('/image/:fileName', (req,res) => {
    res.sendFile('uploads/'+req.params.fileName,{ root: './' });
});


module.exports = router; 