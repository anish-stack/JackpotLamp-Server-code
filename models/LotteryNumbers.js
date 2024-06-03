const mongoose = require('mongoose');

const LotteryTicketSchema = new mongoose.Schema({
    selectNumber: {
        type: Number,
        required: true // Add validation if needed
    },
    quantityOfNumber: {
        type: Number,
        default: 1
    }
});

const minGameSchema = new mongoose.Schema({
    GameName: {
        type: String,
        required: true
    },
    GameId: {
        type: mongoose.Types.ObjectId,
        ref: "Game",
        required: true
    },
    TotalCartPrice: {
        type: Number,
        required: true
    },
    selectedNumbers: [LotteryTicketSchema]
});

// Define schema for the main lottery entry
const LotteryNumberSchema = new mongoose.Schema({
    Game: [minGameSchema],
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    transactionId: {
        type: String
    }
}, { timestamps: true });

// Define models based on schemas
const LotteryNumber = mongoose.model('LotteryNumber', LotteryNumberSchema);

module.exports = LotteryNumber;
