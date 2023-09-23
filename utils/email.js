const nodemailer = require("nodemailer");

// Send the email
const sendEmail = (options) => {
  const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } =
    process.env;

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD
    }
  });

  // Compose the email message
  const mailOptions = {
    from: "John Doe <johndoe@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message
    // html: "<h1>Some html can be passed here</h1>"
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
