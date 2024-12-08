import createError from "http-errors";
// import fs from "fs";
// import * as url from "url";
// import path from "path";

import { mailerValidation } from "../Helpers/validation_schema.js";
import mailer from "../Helpers/Mailer.js";
import { readFileSync } from "../Helpers/index.js";

// const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

// const greetHtml = fs.readFileSync(
//   path.join(__dirname, "../Html/greet.html"),
//   "utf8"
// );

const greetHTML = readFileSync("../Html/greet.html");

export default {
  get: async (req, res, next) => {
    try {
      res.send("Mail Get Route");
    } catch (error) {
      next(error);
    }
  },
  post: async (req, res, next) => {
    try {
      const result = await mailerValidation.validateAsync(req.body);
      if (!result.subject && !result.text) throw createError.BadRequest();

      const { to, subject = "", text = "", attachments } = result;

      if (Array.isArray(to)) {
        let results = [];
        for (const receiver of to) {
          mailer
            // .setTo(receiver)
            .setSubject(subject)
            .setText(text)
            .setCC_BCC(receiver.email, receiver.sending_option)
            .setAttachments(attachments)
            .setHtml(greetHTML)
            .replaceHtmlText("[User]", receiver.profile_name)
            .send()
            .then((info) => results.push(info))
            .catch((error) => {
              throw createError.InternalServerError(error.message);
            });
        }
        res.send("Email Sent: ");
        console.log(results);
      }
    } catch (error) {
      next(error);
    }
  },
};
