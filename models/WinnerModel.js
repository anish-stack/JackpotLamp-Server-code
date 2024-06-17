const mongoose = require('mongoose');

const winningSchema = new mongoose.Schema({
    winningNumber: {
        type: [Number]
    },
    GameName:{
        type: String
    },
   
    winningDate: {
        type: Date,
        default: Date.now // Assigned current date as default value
    }
}, { timestamps: true });

module.exports = mongoose.model('Winning', winningSchema);
