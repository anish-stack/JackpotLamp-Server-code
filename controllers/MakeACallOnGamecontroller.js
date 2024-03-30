const LotteryNumber = require('../models/LotteryNumbers');
const Game = require('../models/NewGames');
const User = require('../models/User.model');

exports.makeApurchaseOfNumber = async (req, res) => {
    try {
        const { gameId, selectedNumbers, totalPrice, perNumberPrice } = req.body;
        console.log(req.body)
        const user = req.user.userId
        // console.log(user)
        // Validate request body
        if (!gameId || !selectedNumbers || !totalPrice || !perNumberPrice) {
            return res.status(400).json({
                success: false,
                msg: "Please provide all required fields."
            });
        }

        // Check if the game exists
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                msg: "Game not found."
            });
        }
        // console.log(game)
        // Validate selected numbers

        // Validate selected numbers
        const { startNumber, endNumber } = game.HowMuchNumber;
        for (const { selectNumber } of selectedNumbers) {
            if (selectNumber < startNumber || selectNumber > endNumber) {
                return res.status(400).json({
                    success: false,
                    msg: `Selected numbers must be between ${startNumber} and ${endNumber}.`
                });
            }
        }


        // Validate total price
        if (totalPrice > game.PricePool) {
            return res.status(400).json({
                success: false,
                msg: `Total price exceeds the maximum price pool of ${game.PricePool}.`
            });
        }

        // Create a new lottery entry
        const lotteryEntry = new LotteryNumber({
            gameName: game.GameName,
            GameId: gameId,
            selectedNumbers,
            totalPrice,
            perNumberPrice,
            user: user
        });

        // Save the lottery entry to the database
        await lotteryEntry.save();

        res.status(200).json({
            success: true,
            msg: "Lottery numbers purchased successfully."
        });
    } catch (error) {
        // console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};

exports.getAllSelectedNumbersAndLengthAndPriceOnNumber = async (req, res) => {
    try {
        // Retrieve all lottery entries from the database
        const lotteryEntries = await LotteryNumber.find();

        // Initialize variables to store the result
        let allSelectedNumbers = [];
        let totalLength = 0;
        let totalPrice = 0;
        let userData = {}; // Object to store user data with associated games

        // Iterate through each lottery entry
        for (const entry of lotteryEntries) {
            // Concatenate selected numbers arrays
            allSelectedNumbers = allSelectedNumbers.concat(entry.selectedNumbers);

            // Update total length
            totalLength += entry.selectedNumbers.length;

            // Calculate total price
            entry.selectedNumbers.forEach(ticket => {
                totalPrice += ticket.quantityOfNumber * ticket.priceOnNumber;
            });

            // Get the associated game details
            const game = await Game.findById(entry.GameId);

            // Get the user ID as a string
            const userId = entry.user.toString();

            // Check if user data already exists for this user
            if (!userData[userId]) {
                // Initialize user data object if it doesn't exist
                userData[userId] = {
                    games: []
                };
            }

            // Add game details to the user data
            userData[userId].games.push({
                gameName: game.GameName,
                gameId: game._id,
                pricePool: game.PricePool // Assuming PricePool is a property of the Game model
            });
        }

        // Send the result as response
        res.status(200).json({
            success: true,
            data: {
                selectedNumbers: allSelectedNumbers,
                totalLength,
                totalPrice,
                userData
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};

exports.MakeWinAanyOneNummberForSingleGameAndaddPrizeinUserFirstTimeSignupBonus = async (req, res) => {
    try {
        const { winningNumber, gameId } = req.body;

        // Check if the game exists
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ success: false, msg: "Game not found." });
        }

        // Check if the game's results have already been announced
        if (game.resultAnounced) {
            return res.status(400).json({ success: false, msg: "Results have already been announced for this game." });
        }

        const prizeObjects = [];

        // Find all lottery entries for the game
        const WinningNumberGame = await LotteryNumber.find({ GameId: gameId });
        for (let i = 0; i < WinningNumberGame.length; i++) {
            const selectedNumbers = WinningNumberGame[i].selectedNumbers;
        
            for (let j = 0; j < selectedNumbers.length; j++) {
                const selectedNumber = selectedNumbers[j].selectNumber;

                // Check if the selected number matches the winning number
                if (winningNumber === selectedNumber) {
                    prizeObjects.push({
                        selectedNumber: selectedNumber,
                        priceOnNumber: selectedNumbers[j].priceOnNumber,
                        quantityOnNumber: selectedNumbers[j].quantityOfNumber,
                        userId: WinningNumberGame[i].user 
                    });
                }
            }
        }

        // Calculate prize per bet and update users' balances with the winning amount
        for (const prizeObj of prizeObjects) {
            const user = await User.findById(prizeObj.userId);
            if (user) {
                const prizePerBet = game.PricePool * prizeObj.priceOnNumber;

                // Ensure that the prize is added only once
                if (!user.prizeAdded) {
                    const userWinning = prizePerBet * prizeObj.quantityOnNumber;
                    user.BalanceAfterWining += userWinning;
                    user.prizeAdded = true; // Set the flag to indicate that prize has been added
                    await user.save();
                }
            }
        }

        // Change the status of LotteryNumber.resultAnounced to true for the game
        game.resultAnounced = true;
        await game.save();

        res.status(200).json({ success: true, msg: "Winning amounts added to users' balances and game result announced." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Internal Server Error." });
    }
};
