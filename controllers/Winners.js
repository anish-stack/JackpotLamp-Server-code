const Winner = require('../models/WinnersModel');

// Create a new winner
exports.createWinner = async (req, res) => {
    try {
        const { name, gameName, prize, image } = req.body;
        const winningDate = req.body.winningDate ? new Date(req.body.winningDate) : new Date();
        
        const newWinner = new Winner({ name, gameName, prize, image, winningDate });
        await newWinner.save();
        
        res.status(201).json({ message: 'Winner created successfully', winner: newWinner });
    } catch (error) {
        res.status(500).json({ message: 'Error creating winner', error: error.message });
    }
};

// Delete a winner
exports.deleteWinner = async (req, res) => {
    try {
        const { id } = req.params;
        await Winner.findByIdAndDelete(id);
        res.status(200).json({ message: 'Winner deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting winner', error: error.message });
    }
};

// Update a winner
exports.updateWinner = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, gameName, prize, image, winningDate } = req.body;

        const updatedWinner = await Winner.findByIdAndUpdate(id, {
            name,
            gameName,
            prize,
            image,
            winningDate: winningDate ? new Date(winningDate) : undefined
        }, { new: true });

        if (!updatedWinner) {
            return res.status(404).json({ message: 'Winner not found' });
        }

        res.status(200).json({ message: 'Winner updated successfully', winner: updatedWinner });
    } catch (error) {
        res.status(500).json({ message: 'Error updating winner', error: error.message });
    }
};

// Get all winners
exports.allWinners = async (req, res) => {
    try {
        const winners = await Winner.find();
        res.status(200).json({ winners });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving winners', error: error.message });
    }
};
