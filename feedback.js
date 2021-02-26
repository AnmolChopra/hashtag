const mongoose = require('mongoose');

const instanse = new mongoose.Schema({
    name: {
        type: String,

    },
    email: {
        type: String,

    },
    mobile: {
        type: String
    },
    message: {
        type: String
    }

})
const feedback = mongoose.model('feedback', instanse);
module.exports = feedback;