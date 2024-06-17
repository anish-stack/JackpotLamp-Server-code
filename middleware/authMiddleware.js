const JWT = require('jsonwebtoken');

const Protect = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1] || req.query.token || req.body.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "Please login first."
            });
        }
        console.log(token)
        // Verify token
        const decoded = JWT.verify(token, process.env.JWT_SECRET);

        // Attach user information to request object for subsequent middleware or route handlers
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            success: false,
            msg: "Invalid token."
        });
    }
};


module.exports=Protect