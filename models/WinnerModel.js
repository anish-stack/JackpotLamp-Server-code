const mongoose = require('mongoose');

const winningSchema = new mongoose.Schema({
    winningNumber: {
        type: [Number]
    },
    GameName:{
        type: String
    },
    // howManyUsersWin: {
    //     type: Number
    // },
    // userInfo: {
    //     name: String, 
    //     contactNumber: Number,
    //     balanceAfterWinning: Number 
    // },
    // gameStartDate: { 
    //     type: String
    // },
    winningDate: {
        type: Date,
        default: Date.now // Assigned current date as default value
    }
}, { timestamps: true });

module.exports = mongoose.model('Winning', winningSchema);
