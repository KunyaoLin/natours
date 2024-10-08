const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    // this.from = `Kunyao Lin <${process.env.EMAIL_FROM}>`;
    this.from = 'kunyaoreact@gmail.com';
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: false,
      debug: true, // 启用调试
      logger: true, // 启用日志记录
    });
  }
  async send(template, subject) {
    try {
      const html = pug.renderFile(
        `${__dirname}/../views/emails/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject,
        },
      );
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText(html),
      };

      await this.newTransport().sendMail(mailOptions);
      console.log('Email sent successfully!');
    } catch (err) {
      console.log('Sent email error!', err);
    }
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token only vaild for 10 minutes',
    );
  }
};
