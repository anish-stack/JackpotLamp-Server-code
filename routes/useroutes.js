const express = require('express')
const { register, verifyOtp, resendOtp, LoginUser, logout, PasswordChangeRequest, newPassword, getAuthKey, getAllUsers } = require('../controllers/Usercontroller')
const route = express.Router()
const Protect = require('../middleware/authMiddleware')
const { createGame, updateGame, deleteGame, getAllGames, getGameByName, MakeADrawForGame, UpdateDraw, DeleteDraw, GetAllDraws } = require('../controllers/GameController')
const { makeApurchaseOfNumber, getAllSelectedNumbersAndLengthAndPriceOnNumber, MakeWinAanyOneNummberForSingleGameAndaddPrizeinUserFirstTimeSignupBonus, makeAWinOnOneNumberGameId, MakeANewPayment, checkStatus, getMyPurchaseNumber, getAllPurchaseNumber } = require('../controllers/MakeACallOnGamecontroller')
const { createWithdrawal, getWithdrawals, addComment, cancelWithdrawal, deleteWithdrawal, releaseWithdrawal, getMyWithdrawals } = require('../controllers/Withdrawal')
const { createWinner,deleteWinner,updateWinner,allWinners } = require('../controllers/Winners')

// ===================================================
// User Routes 
// =================================================== //
route.post('/Register', register)
route.post('/verify-otp', verifyOtp)
route.post('/resend-otp/:email', resendOtp)
route.post('/Login', LoginUser)
route.get('/Logout', Protect, logout)
route.post('/Password-Change-Request', PasswordChangeRequest)
route.post('/Password-verify', newPassword)
route.get('/getAuthKey', getAuthKey)


// ===================================================
// Game Routes 
// =================================================== //

route.post('/create-games', Protect, createGame)
route.get('/games', getAllGames);
route.get('/games/:name', getGameByName);
route.put('/games/:id', updateGame);
route.delete('/games/:id', Protect, deleteGame);
route.post('/draw', MakeADrawForGame);
route.put('/draw/:id', UpdateDraw);
route.delete('/draw/:id', DeleteDraw);
route.get('/draws', GetAllDraws);
route.get('/get-my-purchase',Protect, getMyPurchaseNumber)
route.get('/get-all-purchase', getAllPurchaseNumber)
route.get('/get-all-user',getAllUsers)

// ===================================================
// Call On Games Routes 
route.post('/Create-Withdraw',Protect,createWithdrawal)
route.get('/get-My-Withdraw',getMyWithdrawals)

route.get('/get-Withdraw',getWithdrawals)
route.post('/Add-Any-Withdraw-Comment/:id/Comment',Protect,addComment)
route.patch('/cancel-Withdrawal/:id/cancel', cancelWithdrawal);
route.delete('/delete-withdraws/:id', deleteWithdrawal);
route.patch('/release-payment/:id/release', releaseWithdrawal);

route.post('/winners', createWinner);
route.delete('/winners/:id', deleteWinner);
route.put('/winners/:id', updateWinner);
route.get('/winners', allWinners);

// =================================================== //
route.post('/make-a-games', Protect, makeApurchaseOfNumber)
// route.post('/Paymeny', Protect, MakeANewPayment)

// route.get('/get-all-numbers',getAllSelectedNumbersAndLengthAndPriceOnNumber)
route.post('/status/:txnId', checkStatus)



module.exports = route