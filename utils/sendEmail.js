const nodemailer = require("nodemailer");

// Nodemailer
const sendEmail = async (options) => {
  // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)(object send email)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false port = 587, if true port= 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, //send by him email
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define email options (like from, to, subject, email content)
  const mailOpts = {
    from: process.env.EMAIL_FROM+'<'+process.env.EMAIL_USER+'>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  
  if (!mailOpts.to) {
    throw new Error("No recipients defined");
  }

  // 3) Send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
