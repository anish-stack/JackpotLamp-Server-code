const WithdrawalRequest = require('../models/WithdrawRequest'); // Adjust the path as needed

exports.createWithdrawal = async (req, res) => {
    try {
        const user = req.user.userId;        
        const {  amount, paymentMethod, upiId, accountNumber, bankName, ifscCode, receiverName, mobileNumber } = req.body;
    
        const newRequest = new WithdrawalRequest({
            userId:user,
            amount,
            paymentMethod,
            upiId,
            accountNumber,
            bankName,
            ifscCode,
            receiverName,
            mobileNumber
        });
        
        await newRequest.save();
        res.status(201).json({ message: 'Withdrawal request created successfully', request: newRequest });
    } catch (error) {
        res.status(500).json({ message: 'Error creating withdrawal request', error });
    }
};

exports.getWithdrawals = async (req, res) => {
    try {
        const withdrawals = await WithdrawalRequest.find().populate('userId', 'name email');
        res.status(200).json({ withdrawals });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving withdrawals', error });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user._id
        const { comment } = req.body;
      
        const withdrawal = await WithdrawalRequest.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        withdrawal.comments.push({ userId:user, text:comment });
        await withdrawal.save();
        res.status(200).json({ message: 'Comment added successfully', withdrawal });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error adding comment', error });
    }
};

exports.releaseWithdrawal = async (req, res) => {
    try {
      const { paymentType, transactionId } = req.body;
      const updatedWithdrawal = await WithdrawalRequest.findByIdAndUpdate(
        req.params.id,
        {
          status: 'Completed',
          releasedAt: new Date(),
          paymentType,
          transactionId
        },
        { new: true }
      );
      res.status(200).json({ message: 'Payment released successfully', updatedWithdrawal });
    } catch (error) {
      res.status(500).json({ message: 'Failed to release payment', error });
    }
  };
  
  exports.cancelWithdrawal = async (req, res) => {
    try {
      const { cancelReason } = req.body;
      const updatedWithdrawal = await WithdrawalRequest.findByIdAndUpdate(
        req.params.id,
        {
          status: 'Canceled',
          cancelReason
        },
        { new: true }
      );
      res.status(200).json({ message: 'Withdrawal canceled successfully', updatedWithdrawal });
    } catch (error) {
      res.status(500).json({ message: 'Failed to cancel withdrawal', error });
    }
  };
  
  exports.deleteWithdrawal = async (req, res) => {
    try {
      const { deleteReason } = req.body;
      await WithdrawalRequest.findByIdAndUpdate(
        req.params.id,
        {
          deleteReason
        },
        { new: true }
      );
      await WithdrawalRequest.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Withdrawal deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete withdrawal', error });
    }
  };
exports.getMyWithdrawals = async (req, res) => {
    try {
        // Assuming user ID is available in req.user
        const userId = req.user._id; 
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is missing in the request' });
        }
        
        // Find withdrawals associated with the user
        const withdrawals = await WithdrawalRequest.find({ userId });
        
        // If no withdrawals found for the user
        if (!withdrawals || withdrawals.length === 0) {
            return res.status(404).json({ success: false, message: 'No withdrawals found for the user' });
        }
        
        // Return the withdrawals
        res.status(200).json({ success: true, message: 'Withdrawals retrieved successfully', withdrawals });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving withdrawals', error });
    }
};
