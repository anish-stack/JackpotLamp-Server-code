const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: "happycoding41@gmail.com",
                pass: "baju zdyl nwlx mfsv",
            },
        });

        const mailOptions = {
            from: "happycoding41@gmail.com",
            to: options.Email,
            subject: options.subject,
            html: options.message,
        };
        // console.log(mailOptions)
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendEmail;