const User = require('../models/User.model');
const sendEmail = require('../utils/sendmail');
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;
// Function to generate a 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// Function to register a new user
exports.register = async (req, res) => {
    try {
        const { Name, LastName, Email, Password } = req.body;

        // Check if all required fields are filled
        if (!Name || !LastName || !Email || !Password) {
            return res.status(400).json({
                success: false,
                msg: "Please fill all fields."
            });
        }

        // Check if the user is already registered
        const existUser = await User.findOne({ Email });
        if (existUser) {
            return res.status(403).json({
                success: false,
                msg: "User is already registered with this email ID."
            });
        }

        // Generate OTP
        const generatedOtp = generateOtp();

        // Hash the password
        const hashedPassword = await bcrypt.hash(Password, 10); // 10 is the salt rounds

        // Send OTP to the user's email
        await sendEmail({
            Email: Email,
            subject: "OTP for Email Verification",
            message: `Your OTP is ${generatedOtp}`
        });

        // Create a new user instance with hashed password
        const newUser = new User({
            Name,
            LastName,
            Email,
            Password: hashedPassword,
            Otp: generatedOtp
        });

        // Save the user to the database
        await newUser.save();

        res.status(200).json({
            success: true,
            msg: "User registered successfully. Please verify your email."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};
// Function to verify OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { Email, Otp } = req.body;

        // Check if user exists with the provided email and OTP
        const user = await User.findOne({ Email, Otp });
        if (!user) {
            return res.status(403).json({
                success: false,
                msg: "Invalid email or OTP."
            });
        }

        // Check if the user's email is already verified
        if (user.active) {
            return res.status(403).json({
                success: false,
                msg: "User has already verified their email."
            });
        }

        // Update user status to active and clear OTP
        user.active = true;
        user.Otp = "";
        await user.save();

        res.status(200).json({
            success: true,
            msg: "Email verified successfully."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
}
// Function to resend OTP
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.params;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({
                success: false,
                msg: "Please provide email for resending OTP."
            });
        }

        // Check if user exists with provided email
        const user = await User.findOne({ Email: email });
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found."
            });
        }

        // Check if user's email is already verified
        if (user.active === true) {
            return res.status(400).json({
                success: false,
                msg: "User has already verified their email."
            });
        }


        // Generate new OTP
        const newOtp = generateOtp();

        // Send OTP to the user's email
        await sendEmail({
            Email: email,
            subject: "OTP for Email Verification",
            message: `Your new OTP is ${newOtp}`
        });

        // Update the OTP in the database
        user.Otp = newOtp;
        await user.save();

        res.status(200).json({
            success: true,
            msg: "New OTP sent successfully."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
}
// Function to Login 
exports.LoginUser = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        console.log("Email Via Login", Email);

        // Check if both email and password are provided
        if (!Email || !Password) {
            return res.status(400).json({
                success: false,
                msg: "Please provide both Email & Password."
            });
        }

        // Normalize the email to ensure consistency
        const normalizedEmail = Email.toLowerCase();

        // Find the user in the database based on the provided email
        const user = await User.findOne({ Email: normalizedEmail });
        console.log(user);

        // If the user does not exist
        if (!user) {
            return res.status(401).json({
                success: false,
                msg: "User is not associated with this email."
            });
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(Password, user.Password); // Assuming user.Password is the hashed password
        console.log(isPasswordValid);

        // If the password is incorrect
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                msg: "Invalid password."
            });
        }

        // If email and password are correct, generate a JWT token
        const token = JWT.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

        // Exclude password from the user object
        const userWithoutPassword = {
            _id: user._id,
            Name: user.Name,
            LastName: user.LastName,
            Email: user.Email,
            // Add any other fields you want to include here
        };

        // Send the token and user details in the response
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }).json({
            success: true,
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};
// Function to Logout 
exports.logout = async (req, res) => {
    try {
        // Clear the token on the client-side by removing it from cookies
        res.clearCookie('token');

        // Optionally, you can also invalidate the token on the server-side

        res.status(200).json({
            success: true,
            msg: "Logout successful."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
};
// Function to Password Changes
exports.PasswordChangeRequest = async (req, res) => {
    try {
        const { Email } = req.body;
        console.log(Email);
        const checkUser = await User.findOne({ Email: Email.toLowerCase() });
        if (!checkUser) {
            return res.status(400).json({
                success: false,
                msg: "User Not Found ..."
            });
        }
        console.log(checkUser);
        const newOtp = generateOtp(); // Assuming you have defined generateOtp() somewhere

        // Send OTP to the user's email
        await sendEmail({
            Email: Email,
            subject: "OTP for Password Reset",
            message: `Your new OTP is ${newOtp}`
        });

        // Update the OTP in the database
        checkUser.PasswordResetOtp = newOtp;
        await checkUser.save();
        console.log(checkUser)
        res.status(200).json({
            success: true,
            msg: "Password Reset OTP sent successfully."
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
}

//check password reset otp and newPassword
exports.newPassword = async (req, res) => {
    try {
        const { Email, Otp, newPassword } = req.body;
        if (!Email || !Otp || !newPassword) {
            return res.status(400).json({
                success: false,
                msg: "Please provide all fields."
            });
        }
        const MainEmail = Email.toLowerCase()
        console.log("Pass",newPassword)
        console.log(Email.toLowerCase())
        const checkUser = await User.findOne({ Email:MainEmail });
        if (!checkUser) {
            return res.status(400).json({
                success: false,
                msg: "User not found."
            });
        }
        // console.log(checkUser,"CheckOtp")

        const Checkotp = await User.find({ PasswordResetOtp: Otp });
        console.log(Checkotp,"CheckOtp")
        if (!Checkotp) {
            return res.status(400).json({
                success: false,
                msg: "Invalid OTP."
            });
        }
        if (!Checkotp.length > 0) {
            return res.status(400).json({
                success: false,
                msg: "Invalid OTP."
            });
        }

        // Use the hashed password from the user model
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password and clear the PasswordResetOtp
        checkUser.Password = hashedPassword;
        checkUser.PasswordResetOtp = "";
        await checkUser.save();


        res.status(200).json({
            success: true,
            msg: "Password updated successfully."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error."
        });
    }
}

exports.getAuthKey = async (req, res) => {
    try {

        const token = req.cookies.token
        console.log(token)
        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "User Is unAuthorized"
            })
        }
        res.status(500).json({
            success: true,
            msg: "User Is Authorized"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        })
    }
}