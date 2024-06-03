const mongoose = require('mongoose');

const DrawSchema = new mongoose.Schema({
    GameId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Game'
    },
    gameName: {
        type: String
    },
    WinningNumbers: [String],
    MatchingAll: {
        type: String
    },
    MatchingFour: {
        type: String
    },
    MatchingThree: {
        type: String
    },
    MatchingTwo: {
        type: String
    },
    WinnerAnnounceDate: {
        type: String
    }
}, { timestamps: true });

const DrawModel = mongoose.model('Draw', DrawSchema);
module.exports = DrawModel;
