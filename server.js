require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: 'https://accredian-frontend-task-dun.vercel.app' }));
app.use(express.json());

// Nodemailer Config
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  }
});

// Verify Mail Transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Error with mail transporter:', error);
  } else {
    console.log('Mail transporter is ready to send emails');
  }
});

// Referral Endpoint
app.post('/api/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail, courseName, message } = req.body;
  
  // Check required fields
  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail || !courseName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Store referral in the database
    const referral = await prisma.referral.create({
      data: { referrerName, referrerEmail, refereeName, refereeEmail, courseName, message },
    });

    // Email options
    const mailOptions = {
      from: `Accredian Team <noreply@yourdomain.com>`,
      to: referrerEmail,
      subject: 'Referral Submission Confirmation',
      text: `Hello ${referrerName},\n\nThank you for referring ${refereeName} for "${courseName}".\nWe'll contact you soon.\n\nBest regards,\nThe Accredian Team`,
      html: `<p>Hello ${referrerName},</p>
             <p>Thank you for referring <strong>${refereeName}</strong> for <em>"${courseName}"</em>.</p>
             <p>We'll contact you soon.</p>
             <p>Best regards,<br/>The Accredian Team</p>`
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    return res.status(201).json({ 
      message: 'Referral submitted successfully', 
      referral,
      emailStatus: 'Confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error in /api/referrals:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Graceful Shutdown for Prisma
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from Prisma');
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
