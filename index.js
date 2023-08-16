const express = require("express");
const dotenv = require("dotenv").config();
const nodeMailer = require("nodemailer");
const cors = require("cors");
const asyncHandler = require("express-async-handler");

const server = express();
server.use(express.json());
server.use(cors());

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.SMPT_SERVICE,
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    secure: true,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.toEmail,
    subject: options.subject,
    text: options.message,
    attachments: options.attachments,
  };

  await transporter.sendMail(mailOptions);
};

server.post(
  "/send",
  asyncHandler(async (req, res, next) => {
    const { toEmail, subject, message, attachments } = req.body;
    const newarr = [];
    for (let i = 0; i < attachments.length; i++) {
      let temparr = {};
      temparr["path"] = attachments[i];
      newarr[i] = temparr;
    }
    await sendEmail({ toEmail, subject, message, attachments: newarr });
    res.status(200).json({
      success: true,
      message: `email successfully sent to ${toEmail}. if email does not appear in inbox, please check spam list`,
    });
  })
);

server.use((err, req, res, next) => {
  res.status(400).json({
    success: false,
    message: `Error while sending email ${req.body.toEMail}`,
  });
});

server.listen(process.env.PORT, () => {
  console.log("API server started");
});
