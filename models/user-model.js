const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const imageSchema = new Schema({
    imageId: String,
    reviewStatus: Boolean,
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
    upVotes: Number
}, { strict: false });

const accountSchema = new Schema({
    thirdPartyId: String,
    estimatedSats: Number,
    earnedSats: Number,
    paidSats: Number,
    views: Number,
    userName: String,
    upVotes: Number,
    images: [imageSchema]
});

const User = mongoose.model('User', accountSchema);
 

module.exports = User;
