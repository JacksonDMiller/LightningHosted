const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    commentId: String,
    date: Date,
    comment: String,
    upvotes: Number,
    comenter: String,
    avatar: String,
    comenterId: String,
})

const imageSchema = new Schema({
    userId: String,
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
    upvotes: Number,
    sats: Number,
    numberOfComments: Number,
    fileType: String,
    ogType: String,
    orientation: String,
    twitterCard: String,
    suppressed: Boolean,
    comments: [commentSchema],
    recentViews: [{ type: String }]

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
    userName: String,
    upvotes: Number,
    avatar: String,
    images: [imageSchema]
});

const Users = mongoose.model('Users', accountSchema);


module.exports = Users;