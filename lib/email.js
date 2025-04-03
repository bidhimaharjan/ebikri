import nodemailer from 'nodemailer';

// create transporter
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

// track last send time to enforce rate limiting
let lastSendTime = 0;

export const sendCampaignEmail = async (to, subject, html, businessName) => {
  try {
    // calculate required delay
    const now = Date.now();
    const timeSinceLastSend = now - lastSendTime;
    const minDelay = 2000;
    
    if (timeSinceLastSend < minDelay) {
      const delayNeeded = minDelay - timeSinceLastSend;
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }

    const info = await transporter.sendMail({
      from: `"${businessName}" <no-reply@ebikri.com>`,
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