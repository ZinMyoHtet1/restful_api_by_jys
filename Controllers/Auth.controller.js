import createError from "http-errors";
import Joi from "@hapi/joi";

import User from "../Models/User.model.js";
import {
  userLoginValidation,
  userRegisterValidation,
} from "../Helpers/validation_schema.js";
import {
  generateVerificationId,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../Helpers/jwt_helper.js";
import client from "../Helpers/redis_init.js";
import { generateOTP, hashedPassword, readFileSync } from "../Helpers/index.js";
import tempStorage from "../Helpers/OTPstorage.js";
import mailer from "../Helpers/Mailer.js";

const emailValidation = Joi.string().email().required();

const verificationEmailTemplate = readFileSync(
  "../Html/verificationEmail.html"
);

export default {
  register: async (req, res, next) => {
    try {
      // const { email, password } = req.body;
      const result = await userRegisterValidation.validateAsync(req.body);
      // if (!email && !password) throw createError.BadRequest();
      const isExisted = await User.findOne({ email: result.email });
      if (isExisted)
        throw createError.Conflict(
          `${result.email} already had been registered`
        );

      const user = new User(result);
      await user.save();

      const id = generateVerificationId({
        name: result.name,
        email: result.email,
        // password: result.password,
      });
      mailer
        .setTo(result.email)
        .setSubject("Verification Email")
        .setHtml(verificationEmailTemplate)
        .replaceHtmlText("{{PORT}}", 3000)
        .replaceHtmlText("{{ID}}", id)
        .send()
        .then((info) => {
          res.send("Email Sent : Please check your email to verify");
        })
        .catch((error) => {
          throw createError.InternalServerError(error.message);
        });
      // const user = new User(result);
      // const savedUser = await user.save();
      // const accessToken = await signAccessToken(savedUser.id);
      // const refreshToken = await signRefreshToken(savedUser.id);

      // res.send({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await userLoginValidation.validateAsync(req.body);
      const user = await User.findOne({ email: result.email });
      if (!user) throw createError.NotFound(`${result.email} is not found`);

      const isMatch = await user.isValidatePassword(result.password);
      if (!isMatch) throw createError.Unauthorized("Password is not correct");

      if (!user.isVerified) {
        console.log("not verified");
        const id = generateVerificationId({
          name: user.name,
          email: user.email,
          // password: result.password,
        });

        mailer
          .setTo(result.email)
          .setSubject("Verification Email")
          .setHtml(verificationEmailTemplate)
          .replaceHtmlText("{{PORT}}", 3000)
          .replaceHtmlText("{{ID}}", id)
          .send()
          .then((info) => {
            res.send("Email Sent : Please check your email to verify");
          })
          .catch((error) => {
            console.log(error, "error");
            throw createError.InternalServerError(error.message);
          });
      } else {
        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);

        res.send({ accessToken, refreshToken });
      }
    } catch (error) {
      if (error.isJoi === true) throw next(createError.BadRequest());
      next(error);
    }
  },

  refresh_token: async (req, res, next) => {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refresh_token);

      const accessToken = await signAccessToken(userId);
      const refreshToken = await signRefreshToken(userId);

      res.send({ accessToken, refreshToken });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);
      client
        .DEL(userId)
        .then(() => res.sendStatus(204))
        .catch((err) => {
          throw createError.InternalServerError(err.message);
        });
    } catch (error) {
      next(error);
    }
  },

  forgetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) throw createError.BadRequest();
      const validEmail = await emailValidation.validateAsync(email);

      const doesExist = await User.findOne({ email: validEmail });
      if (!doesExist)
        throw createError.NotFound(`${validEmail} is not registered.`);

      const otp = generateOTP();
      tempStorage.set(validEmail, otp);

      const otpHTMLtemplate = readFileSync("../Html/otpCode.html");

      mailer
        .setTo(validEmail)
        .setSubject("Forget Password OTP")
        .setHtml(otpHTMLtemplate)
        .replaceHtmlText("{{OTP-CODE}}", otp)
        .send()
        .then((info) => res.send("Email Sent : " + "otp code (" + otp + ")"))
        .catch((error) => {
          throw createError.InternalServerError(error.message);
        });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  verifyOTP: async (req, res, next) => {
    try {
      const { email, otp, newPassword } = req.body;
      const validEmail = await emailValidation.validateAsync(email);
      if (!otp) throw createError.BadRequest();

      const doesExist = await User.findOne({ email: validEmail });
      if (!doesExist)
        throw createError.NotFound(`${validEmail} is not registered.`);

      if (tempStorage.verify(validEmail, otp)) {
        const password = await hashedPassword(newPassword);
        const updatedUser = await User.findOneAndUpdate(
          { email: validEmail },
          { $set: { password } },
          { new: true }
        );
        res.send(updatedUser);
      } else {
        throw createError.Unauthorized("Invalid credentials");
      }
    } catch (error) {
      next(error);
    }
  },

  verifyID: async (req, res, next) => {
    try {
      console.log("verify");
      const { email, name } = req?.user;
      if (!email && !name) throw createError.Unauthorized();
      const user = await User.findOne({ email: req.user.email });

      if (!user) throw createError.NotFound(`${email} is not registered`);
      const verifiedUser = await User.findOneAndUpdate(
        { email },
        { $set: { isVerified: true } }
      );

      const accessToken = await signAccessToken(verifiedUser.id);
      const refreshToken = await signRefreshToken(verifiedUser.id);
      res.send({ accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  },
};
