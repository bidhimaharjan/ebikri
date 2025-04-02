import nodemailer from 'nodemailer';

// Configure transporter with strict rate limiting
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  pool: true,
  maxConnections: 1,       // only one connection at a time
  maxMessages: 1,          // send only 1 email per connection
  rateDelta: 2000,         // minimum 2 seconds between emails
  rateLimit: 1             // max 1 email per rateDelta
});

// Track last send time to enforce rate limiting
let lastSendTime = 0;

export const sendCampaignEmail = async (to, subject, html) => {
  try {
    // Calculate required delay
    const now = Date.now();
    const timeSinceLastSend = now - lastSendTime;
    const minDelay = 2000; // Mailtrap free tier requires 2s between emails
    
    if (timeSinceLastSend < minDelay) {
      const delayNeeded = minDelay - timeSinceLastSend;
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }

    const info = await transporter.sendMail({
      from: `"eBikri" <no-reply@ebikri.com>`,
      to,
      subject,
      html
    });

    lastSendTime = Date.now();
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};