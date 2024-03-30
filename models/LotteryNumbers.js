const mongoose = require('mongoose');

const LotteryTicketSchema = new mongoose.Schema({
    selectNumber: {
        type: Number,
        // Add validation if needed
    },
    quantityOfNumber: {
        type: Number,
        default: 1
    },
    priceOnNumber: {
        type: Number,
        default: 100
    }
});

// Define schema for the main lottery entry
const LotteryNumberSchema = new mongoose.Schema({
    gameName: {
        type: String,
        required: true
    },
    GameId:{
        type: mongoose.Types.ObjectId,
        ref: "Game" 
    },
    selectedNumbers: [LotteryTicketSchema],
    totalPrice: {
        type: Number,
        required: true
    },
    perNumberPrice: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User" 
    },
    resultAnounced:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

// Define models based on schemas
const LotteryNumber = mongoose.model('LotteryNumber', LotteryNumberSchema);

module.exports =  LotteryNumber ;
