const express = require('express')
const { register, verifyOtp, resendOtp, LoginUser, logout, PasswordChangeRequest, newPassword, getAuthKey } = require('../controllers/Usercontroller')
const route = express.Router()
const Protect= require('../middleware/authMiddleware')
const { createGame , updateGame, deleteGame, getAllGames,getGameByName} = require('../controllers/GameController')
const { makeApurchaseOfNumber, getAllSelectedNumbersAndLengthAndPriceOnNumber, MakeWinAanyOneNummberForSingleGameAndaddPrizeinUserFirstTimeSignupBonus } = require('../controllers/MakeACallOnGamecontroller')

// ===================================================
            // User Routes 
// =================================================== //
route.post('/Register',register)
route.post('/verify-otp',verifyOtp)
route.post('/resend-otp/:email',resendOtp)
route.post('/Login',LoginUser)
route.get('/Logout',Protect,logout)
route.post('/Password-Change-Request',PasswordChangeRequest)
route.post('/Password-verify',newPassword)
route.get('/getAuthKey',getAuthKey)


// ===================================================
            // Game Routes 
// =================================================== //

route.post('/create-games',Protect,createGame)
route.get('/games', getAllGames);
route.get('/games/:name', getGameByName);
route.put('/games/:id', Protect, updateGame);
route.delete('/games/:id', Protect, deleteGame);

// ===================================================
            // Call On Games Routes 
// =================================================== //
route.post('/make-a-games',Protect,makeApurchaseOfNumber)
route.get('/get-all-numbers',getAllSelectedNumbersAndLengthAndPriceOnNumber)
route.post('/make-a-win-numbers',MakeWinAanyOneNummberForSingleGameAndaddPrizeinUserFirstTimeSignupBonus)



module.exports=route