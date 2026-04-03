// utils/otp.js
const nodemailer = require('nodemailer');
const OTP = require('../models/Otp.js');
const crypto = require('crypto');

exports.generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString(); // Generates a 6-digit OTP
};

exports.sendOTPEmail = async (email, otp) => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Email Verification Code',
        text: `Your OTP code for IOT Device is ${otp}. It will expire in 10 minutes.`,
    });
};

exports.saveOTP = async (userId, otp) => {
    const expiresAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    const otpDoc = new OTP({ userId, otp, expiresAt });
    await otpDoc.save();
};

exports.verifyOTPService = async (userId, otp) => {
    const otpDoc = await OTP.findOne({ userId, otp, verified: false });

    if (!otpDoc) return false;

    if (otpDoc.expiresAt < Date.now()) {
        await OTP.deleteOne({ _id: otpDoc._id });
        return false;
    }

    otpDoc.verified = true;
    await otpDoc.save();
    return true;
};
