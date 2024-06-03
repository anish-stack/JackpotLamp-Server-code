const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for bcrypt hashing

const UserSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: [true, "Please Enter Your Name"],
    },
    LastName: {
        type: String,
        required: [true, "Please Enter Your LastName"]
    },
    Email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true
    },
    Password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        min: 6,
        max: 14
    },
    active:{
        type: Boolean,
        default:false
    },
    Otp:{
        type:String,
    },
    PasswordResetOtp:{
        type:String,
    },
    FirstTimeSignupBonus:{
        type:Number,
        default:50
    },
    RefrealBonus:{
        type:Number,
    },
    BalanceAfterWining:{
        type:Number,
        default:0

    },
    Role:{
        type:String,
        default:"User"
    }

}, { timestamps: true });



// Method to compare passwords
UserSchema.methods.comparePassword = async function(plaintextPassword) {
    try {
        // Use bcrypt to compare the provided password with the hashed password
        return await bcrypt.compare(plaintextPassword, this.Password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
