import nodemailer from "nodemailer";

class Mailer {
  receivers = [];
  service = "gmail";
  host = "smtp.gmail.com";
  port = 587;
  constructor() {
    this.from = process.env.EMAIL;
    this.mailOptions = {
      from: {
        address: process.env.EMAIL,
        name: "JYS Coding",
      },
      to: [],
      attachments: [],
    };
  }
  _transporter() {
    return nodemailer.createTransport({
      service: this.service,
      host: this.host,
      port: this.port,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   *
   * @param {string} name
   * @returns
   */

  setCompanyName(name) {
    this.mailOptions.from.name = name;
    return this;
  }

  // setToReceivers(receivers) {
  //   this.receivers = receivers;
  //   let emails = receivers.map((receiver) => receiver.email);
  //   this.setTo(emails);
  //   return this;
  // }

  /**
   *
   * @param {string | Array<string>} receiver
   * @returns
   */

  setTo(receiver) {
    const receivers = this.mailOptions.to || [];
    if (Array.isArray(receiver)) {
      receiver.forEach((rc) => {
        receivers.push(rc);
      });
    } else {
      receivers.push(receiver);
    }

    this.mailOptions.to = receivers;
    return this;
  }

  /**
   *
   * @param {string} subject
   * @returns
   */

  setSubject(subject) {
    this.mailOptions.subject = subject;
    return this;
  }

  /**
   *default option => cc
   * @param {Array<string> | string} receiver
   * @param {string} option
   * @returns
   */

  setCC_BCC(receiver, option = "cc") {
    const cc_receivers = this.mailOptions.cc || [];
    const bcc_receivers = this.mailOptions.bcc || [];

    if (Array.isArray(receiver)) {
      receiver.forEach((rc) => {
        if (option === "bcc") {
          bcc_receivers.push(rc);
        }
        cc_receivers.push(rc);
      });
    } else {
      if (option === "bcc") {
        bcc_receivers.push(receiver);
      } else {
        cc_receivers.push(receiver);
      }
    }

    this.mailOptions.cc = cc_receivers;
    this.mailOptions.bcc = bcc_receivers;

    return this;
  }

  /**
   *
   * @param {string} text
   * @returns
   */
  setText(text) {
    this.mailOptions.text = text;
    return this;
  }

  /**
   *
   * @param {string} html
   * @returns
   */

  setHtml(htmlData) {
    this.mailOptions.html = htmlData;
    return this;
  }

  replaceHtmlText(from, to) {
    const preHtml = this.mailOptions.html || "";
    const html = preHtml.replace(from, to);
    this.mailOptions.html = html;
    return this;
  }

  /**
   *
   * @param {object | Array<object>} attachments
   * @returns
   */

  setAttachments(attachment) {
    const attachments = this.mailOptions.attachments || [];
    if (Array.isArray(attachment)) {
      attachment.forEach((att) => attachments.push(att));
    } else {
      attachments.push(attachment);
    }

    this.mailOptions.attachments = attachments;
    return this;
  }

  send() {
    return new Promise((resolve, reject) => {
      this._transporter()
        .sendMail(this.mailOptions)
        .then((info) => resolve(info))
        .catch((error) => reject(error));
    });
  }
}

export const sendEmail = function async(to, subject, text, html = "") {
  return new Mailer()
    .setTo(to)
    .setSubject(subject)
    .setHtml(html)
    .setText(text)
    .send();
};

export default new Mailer();
