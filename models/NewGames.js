const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    GameName: {
        type: String,
        required: true
    },
    PricePool: {
        type: Number,
        required: true,
        default: 0 
    },
    DateAndTimeOfWinnerAnnouncement: {
        type: String, 
        required: true
    },
    TimeDate: { 
        Date: {
            type: String 
        },
        Time: {
            type: String
        },
        Hours: {
            type: String
        }
    },
    HowMuchNumber: {
        startNumber: {
            type: Number,
            required: true
        },
        endNumber: {
            type: Number,
            required: true
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Game", GameSchema);
