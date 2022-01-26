const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const pdfSchema = new Schema({
    url: String,
    filename: String,

    document: {}
})

const querySchema = new Schema({
    timestamp: Date,
    templateID: {
        type: Number,
        default: 0,
        required: true
    },
    parsed: [
        pdfSchema
    ],
    options: [String]
})

module.exports = mongoose.model('Query', querySchema);