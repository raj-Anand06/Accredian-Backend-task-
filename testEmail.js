const nodemailer = require('nodemailer');
require('dotenv').config();

const testTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

testTransporter.sendMail({
    from: process.env.GMAIL_USER,
    to: 'rajanand62004@email.com',
    subject: 'Test Email',
    text: 'This is a test email'
}, (err, info) => {
    if (err) console.error('Test failed:', err);
    else console.log('Test succeeded:', info);
});