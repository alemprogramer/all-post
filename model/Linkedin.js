const { Schema, model } = require('mongoose');

const linkedinSchema = new Schema({
    id: String,//linkedin account id
    userId: { // our database user _id
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    email: String,
    accessToken: String,
    name: String,
    profilePic: String,
    expiresInAccessToken: Number,
    refreshToken: String,
    expiresInRefreshToken: Number,
    organization: [{
        type: Schema.Types.ObjectId,
        ref: 'LinkedinOrganization'
    }],
});


module.exports = model('Linkedin', linkedinSchema);