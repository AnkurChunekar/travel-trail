const nodemailer = require("nodemailer");
const pug = require("pug");
const path = require("path");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;
    [this.firstName, this.lastName] = user.name.split(" ");
  }

  static createNewTransport() {
    if (process.env.NODE_ENV === "production") {
      return "create a production transporter";
    }

    const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } =
      process.env;

    return nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      path.join(__dirname, `/views/emails/${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
    };

    await this.createNewTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to travel trail family");
  }
};

// Old send mail code
// const sendEmail = (options) => {
//   const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } =
//     process.env;

//   // Create a transporter object
//   const transporter = nodemailer.createTransport({
//     host: EMAIL_HOST,
//     port: EMAIL_PORT,
//     auth: {
//       user: EMAIL_USERNAME,
//       pass: EMAIL_PASSWORD
//     }
//   });

//   // Compose the email message
//   const mailOptions = {
//     from: "John Doe <johndoe@gmail.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//     // html: "<h1>Some html can be passed here</h1>"
//   };

//   return transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
