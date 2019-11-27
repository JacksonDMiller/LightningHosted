const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subCommentSchema = new Schema({
    subCommentId: String,
    date: Date,
    comment: String,
    upVotes: Number,
})

const commentSchema = new Schema({
    commentId: String,
    date: Date,
    comment: String,
    upVotes: Number,
    subComments: [subCommentSchema]
})

const imageSchema = new Schema({
    imageId: String,
    reviewStatus: Boolean,
    payStatus: Boolean,
    deleted: Boolean,
    views: Number,
    reports: Number,
    fileName: String,
    thumbNail: String,
    width: Number,
    height: Number,
    date: Date,
    title: String,
    caption: String,
    paymentRequest: String,
    upVotes: Number,
    sats :Number,
    numberOfComments: Number,
    fileType: String,
    ogType: String,
    orientation: String,
    twitterCard: String,
    suppressed:  Boolean,
    comments: [commentSchema]
    
});

const accountSchema = new Schema({
    password: String,
    email: String,
    thirdPartyId: String,
    estimatedSats: Number,
    earnedSats: Number,
    sats: Number,
    paidSats: Number,
    views: Number,
    username: String,
    upVotes: Number,
    images: [imageSchema]
});

const User = mongoose.model('User', accountSchema);
 

module.exports = User;
