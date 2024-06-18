const LotteryNumber = require('../models/LotteryNumbers');
const Game = require('../models/NewGames');
const User = require('../models/User.model');
const Winner = require('../models/WinnerModel');
const crypto = require('crypto');
const axios = require('axios');
const jwt = require('jsonwebtoken')
const merchantid = "SEEMACOLLECTIONUAT";
const apikey = "e083b73b-9b33-4e7a-af49-15c751c16b2c";

exports.makeApurchaseOfNumber = async (req, res) => {
    try {
        console.log(req.body);
        const { cart } = req.body;
        const user = req.user.userId;

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: "Please Login First"
            });
        }

        // Validate request body
        if (!cart || cart.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Please provide cart items."
            });
        }

        let totalCartPrice = 0; // Initialize total cart price
        let gamesArray = []; // Array to hold game entries

        // Loop through each cart item to handle multiple games purchase
        for (const item of cart) {
            const { gameId: GameId, GameNumbers: numbersArray, gamePrice, gameName } = item;

            if (!GameId || !numbersArray || !gamePrice) {
                return res.status(400).json({
                    success: false,
                    msg: "Please provide all required fields."
                });
            }

            // Format selectedNumbers as an array of objects
            const selectedNumbers = numbersArray.map(num => ({ selectNumber: num }));

            // Check if the game exists
            const game = await Game.findById(GameId);
            if (!game) {
                return res.status(404).json({
                    success: false,
                    msg: `Game with ID ${GameId} not found.`
                });
            }

            // Validate total price
            if (gamePrice > game.PricePool) {
                return res.status(400).json({
                    success: false,
                    msg: `Total price exceeds the maximum price pool of ${game.PricePool}.`
                });
            }

            // Add to total cart price
            totalCartPrice += gamePrice;

            // Add game entry to the gamesArray
            gamesArray.push({
                GameName: gameName,
                GameId,
                TotalCartPrice: gamePrice,
                selectedNumbers
            });
        }

        // Call the payment function once with the total cart price
        const paymentResponse = await MakeANewPayment(totalCartPrice, req, res);

        if (paymentResponse) {
            // Create a new lottery entry with the transaction ID from the payment response
            const lotteryEntry = new LotteryNumber({
                Game: gamesArray,
                user,
                transactionId: paymentResponse.data.transactionId
            });

            // Save the lottery entry to the database
            await lotteryEntry.save();

            res.status(200).json({
                success: true,
                msg: "Lottery numbers purchased successfully.",
                paymentData: paymentResponse.data
            });
        } else {
            res.status(500).json({
                success: false,
                msg: "Payment failed."
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};


async function MakeANewPayment(totalPrice, req, res) {
    try {
        function generateMerchantTransactionId() {
            const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const idLength = 25;
            let transactionId = '';

            for (let i = 0; i < idLength; i++) {
                const randomIndex = Math.floor(Math.random() * allowedCharacters.length);
                transactionId += allowedCharacters.charAt(randomIndex);
            }

            return transactionId;
        }

        function generateMerchantUserId() {
            const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const idLength = 25;
            let merchantUserId = '';

            for (let i = 0; i < idLength; i++) {
                const randomIndex = Math.floor(Math.random() * allowedCharacters.length);
                merchantUserId += allowedCharacters.charAt(randomIndex);
            }

            return merchantUserId;
        }

        const merchantTransactionId = generateMerchantTransactionId();
        const merchantUserId = generateMerchantUserId();

        const data = {
            merchantId: merchantid,
            merchantTransactionId,
            merchantUserId,
            name: "User",
            amount: totalPrice * 100, // Convert to minor units
            redirectUrl: `https://api.jackpotlamp.com/api/v1/status/${merchantTransactionId}?token=${req.headers.authorization ? req.headers.authorization.split(" ")[1] : ''}`,
            redirectMode: 'POST',
            mobileNumber: "123456789",
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + apikey;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const testURL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
        const options = {
            method: 'POST',
            url: testURL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        const response = await axios.request(options);
        return response; // Returning the response from PhonePe API
    } catch (error) {
        console.error(error);
        throw new Error(error.message); // Throwing the error to be caught in the calling function
    }
}


exports.checkStatus = async (req, res) => {
    // Extract token from URL query parameters
    const token = req.query.token;
    console.log(token)
    // Decode token to get user ID
    let userId;
    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            userId = decodedToken.userId;
            console.log(decodedToken)
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    } else {
        return res.status(400).json({ success: false, message: "Token not provided" });
    }

    // Log the user information (for debugging)
    console.log("User ID:", userId);

    // Extract the merchantTransactionId from the request body
    const { transactionId: merchantTransactionId } = req.body;

    // Check if the merchantTransactionId is available
    if (!merchantTransactionId) {
        return res.status(400).json({ success: false, message: "Merchant transaction ID not provided" });
    }

    // Retrieve the merchant ID from the environment variables or constants
    const merchantId = merchantid;

    // Generate the checksum for authentication
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + apikey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;
    const testUrlCheck = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1"

    // Prepare the options for the HTTP request
    const options = {
        method: 'GET',
        url: `${testUrlCheck}/status/${merchantid}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantid}`
        }
    };

    try {
        // Send the HTTP request to check the payment status
        const response = await axios.request(options);

        // Check if the payment was successful
        if (response.data.success === true) {
            // Fetch the most recent order associated with the user within a certain timestamp range
            const timestampThreshold = new Date(Date.now() - (24 * 60 * 60 * 1000)); // Example: Orders within the last 24 hours
            const userOrders = await LotteryNumber.find({ user: userId, createdAt: { $gt: timestampThreshold } })
                .sort({ createdAt: -1 })
                .limit(1);

            // Check if any orders are found
            if (!userOrders || userOrders.length === 0) {
                return res.status(404).json({ success: false, message: "No recent orders found for the user" });
            }

            // Update the order status to "Confirmed" with the transaction ID
            const orderId = userOrders[0]._id;
            await LotteryNumber.findByIdAndUpdate(orderId, { transactionId: merchantTransactionId });

            // Redirect the user to the success page
            console.log("Success Hai Bro Payment")
            const successRedirectUrl = `${process.env.FRONTEND_URL}/Game-Purchase-Success`;
            return res.redirect(successRedirectUrl);
        } else {
            const FailedRedirectUrl = `${process.env.FRONTEND_URL}/Game-Purchase-Failed`;
            return res.redirect(FailedRedirectUrl);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.getMyPurchaseNumber = async (req, res) => {
    try {
       console.log(req.user)
       const id = req.user.userId
        const MyPurchase = await LotteryNumber.find({user:id});
        // console.log(userId)
        res.status(200).json({ success: true, data: MyPurchase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getAllPurchaseNumber = async (req, res) => {
    try {
  
        const MyPurchase = await LotteryNumber.find();
        // console.log(userId)
        res.status(200).json({ success: true, data: MyPurchase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};









exports.makeAWinOnOneNumberGameId = async (req, res) => {
    try {
        const { id, number } = req.body
        if (!id || !number) {
            return res.status(400).json({
                success: false,
                msg: "Please Provide All Feilds"
            })
        }
        // check game
        const checkgame = await Game.findById(id)
        if (!checkgame) {
            return res.status(400).json({
                success: false,
                msg: "Game Not Found"
            })
        }

        const checkWinningDateIsEqualToDateNow = await Game.findOne({ DateAndTimeOfWinnerAnnouncement: { $eq: Date.now() } });
        if (!checkWinningDateIsEqualToDateNow) {
            return res.status(400).json({
                success: false,
                msg: "Winner Announcement has not been made for the current date"
            });
        }



    } catch (error) {
        console.log(error)
    }
}