const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    gameName: {
        type: String,
        required: true
    },
    winningDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    prize: {
        type: Number,
        required: true
    },
    image: {
        type: String, // Assuming you store image URLs
        required: true
    }
});

const Winner = mongoose.model('Winner', winnerSchema);

module.exports = Winner;
