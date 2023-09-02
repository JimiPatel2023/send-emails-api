const express = require("express");
const dotenv = require("dotenv").config();
const nodeMailer = require("nodemailer");
const cors = require("cors");
const multer = require("multer");
const asyncHandler = require("express-async-handler");
var bodyParser = require("body-parser");

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(multer().array());
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
    subject: options.subject || `email from ${options.toEmail}`,
    html: options.html || ``,
    text: options.message || `email from ${options.toEmail}`,
    attachments: options.attachments || [],
  };

  try {
    await transporter.sendMail(mailOptions);
    options.res.status(200).json({
      success: true,
      message: `email successfully sent to ${options.toEmail}. if email does not appear in inbox, please check spam list`,
    });
  } catch (error) {
    options.res.status(200).json({
      success: false,
      message: `Error : ${error.message}`,
    });
  }
};

server.post(
  "/send",
  asyncHandler(async (req, res, next) => {
    const { toEmail, subject, message, attachments, html } = req.body;
    const newarr = [];
    if (attachments !== undefined) {
      for (let i = 0; i < attachments.length; i++) {
        let temparr = {};
        temparr["path"] = attachments[i];
        newarr[i] = temparr;
      }
    }
    await sendEmail({
      toEmail,
      subject,
      message,
      attachments: newarr,
      html,
      res,
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
