const Game = require('../models/NewGames')
const Draw = require('../models/DrawModel')

// Function to validate date and time format
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    return regex.test(dateString);
}
exports.createGame = async (req, res) => {
    try {
        const { GameName, PricePool, DateAndTimeOfWinnerAnnouncement, TimeDate, HowMuchNumber } = req.body;

        // Check if all required fields are provided
        if (!GameName || !PricePool || !DateAndTimeOfWinnerAnnouncement || !TimeDate || !HowMuchNumber) {
            return res.status(400).json({
                success: false,
                msg: "Please provide all game information."
            });
        }

        // Price Pool Validation
        if (isNaN(PricePool) || PricePool <= 0) {
            return res.status(400).json({
                success: false,
                msg: "Price pool must be a positive number."
            });
        }

        // Date and Time Validation
        if (!isValidDate(DateAndTimeOfWinnerAnnouncement)) {
            return res.status(400).json({
                success: false,
                msg: "Invalid date and time format for DateAndTimeOfWinnerAnnouncement."
            });
        }

        // Number Range Validation
        if (HowMuchNumber.startNumber >= HowMuchNumber.endNumber) {
            return res.status(400).json({
                success: false,
                msg: "startNumber must be less than endNumber."
            });
        }

        // Create a new game instance
        const newGame = new Game({
            GameName,
            PricePool,
            DateAndTimeOfWinnerAnnouncement,
            TimeDate,
            HowMuchNumber
        });

        // Save the new game to the database
        await newGame.save();

        res.status(201).json({
            success: true,
            msg: "Game created successfully.",
            data: newGame
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};

exports.updateGame = async (req, res) => {
    try {
        const gameId = req.params.id;
        const updates = req.body;

        // Check if there are no fields to update
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No fields to update."
            });
        }

        const options = { new: true }; // Return the modified document
        const updatedGame = await Game.findByIdAndUpdate(gameId, updates, options);
        if (!updatedGame) {
            return res.status(404).json({
                success: false,
                msg: "Game not found."
            });
        }

        res.status(200).json({
            success: true,
            msg: "Game updated successfully.",
            data: updatedGame
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};

exports.deleteGame = async (req, res) => {
    try {
        const gameId = req.params.id;
        const deletedGame = await Game.findByIdAndDelete(gameId);
        if (!deletedGame) {
            return res.status(404).json({
                success: false,
                msg: "Game not found."
            });
        }
        res.status(200).json({
            success: true,
            msg: "Game deleted successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};

exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json({
            success: true,
            data: games
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};

exports.getGameByName = async (req, res) => {
    try {
        const gameName = req.params.name;

        // Find the game by name
        const game = await Game.findOne({ GameName: gameName });

        if (!game) {
            return res.status(404).json({
                success: false,
                msg: "Game not found."
            });
        }

        res.status(200).json({
            success: true,
            data: game
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};

exports.MakeADrawForGame = async (req, res) => {
    try {
        const { GameId, gameName, WinningNumbers, MatchingAll, MatchingFour, MatchingThree, MatchingTwo, WinnerAnnounceDate } = req.body
        if (!GameId || !gameName || !WinnerAnnounceDate || !WinningNumbers || !MatchingAll || !MatchingTwo || !MatchingThree || !MatchingFour) {
            return res.status(403).json({
                success: false,
                msg: "Please Filled All Required Fields."
            });
        }
        const NewGameDraw = new Draw({
            GameId,
            gameName,
            WinningNumbers,
            MatchingAll,
            MatchingFour,
            MatchingThree,
            MatchingTwo,
            WinnerAnnounceDate
        })
        await NewGameDraw.save()
        res.status(201).json({
            success: true,
            data: NewGameDraw,
            msg: "Draw Successful"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
}

exports.UpdateDraw = async (req, res) => {
    try {
        const { id } = req.params;
        const { GameId, gameName, WinningNumbers, MatchingAll, MatchingFour, MatchingThree, MatchingTwo, WinnerAnnounceDate } = req.body;

        const updateFields = {};
        if (GameId) updateFields.GameId = GameId;
        if (gameName) updateFields.gameName = gameName;
        if (WinningNumbers) updateFields.WinningNumbers = WinningNumbers;
        if (MatchingAll) updateFields.MatchingAll = MatchingAll;
        if (MatchingFour) updateFields.MatchingFour = MatchingFour;
        if (MatchingThree) updateFields.MatchingThree = MatchingThree;
        if (MatchingTwo) updateFields.MatchingTwo = MatchingTwo;
        if (WinnerAnnounceDate) updateFields.WinnerAnnounceDate = WinnerAnnounceDate;

        const updatedDraw = await Draw.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedDraw) {
            return res.status(404).json({
                success: false,
                msg: "Draw not found."
            });
        }

        res.status(200).json({
            success: true,
            data: updatedDraw,
            msg: "Draw Updated Successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};

exports.DeleteDraw = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedDraw = await Draw.findByIdAndDelete(id);

        if (!deletedDraw) {
            return res.status(404).json({
                success: false,
                msg: "Draw not found."
            });
        }

        res.status(200).json({
            success: true,
            data: deletedDraw,
            msg: "Draw Deleted Successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};

exports.GetAllDraws = async (req, res) => {
    try {
        const draws = await Draw.find();

        res.status(200).json({
            success: true,
            data: draws,
            msg: "All Draws Retrieved Successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};
