import JWT from "jsonwebtoken";
import createError from "http-errors";

import client from "./redis_init.js";

const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      expiresIn: "1h",
      issuer: "jys-package.com",
      audience: userId,
    };

    JWT.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      options,
      (err, token) => {
        if (err) return reject(createError.InternalServerError());
        resolve(token);
      }
    );
  });
};

const verifyAccessToken = (req, res, next) => {
  if (!req.headers["authorization"]) return next(createError.Unauthorized());
  const bearerToken = req.headers["authorization"].split(" ");
  const token = bearerToken[1];
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "unauthorized" : err.message;
      return next(message);
    }
    req.payload = payload;
    next();
  });
};

const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      expiresIn: "1y",
      audience: userId,
      issuer: "jys-package.com",
    };

    JWT.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      options,
      (err, token) => {
        if (err) {
          reject(createError.InternalServerError());
          return;
        }
        client
          .SET(userId, token, {
            EX: 365 * 24 * 60 * 60,
            NX: true,
          })
          .then(() => resolve(token))
          .catch((err) => reject(createError.InternalServerError(err.message)));
      }
    );
  });
};

const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
      if (err) return reject(createError.InternalServerError());
      const userId = payload.aud;

      client
        .GET(userId)
        .then((result) => {
          if (token === result) return resolve(userId);
          reject(createError.Unauthorized());
          return;
        })
        .catch((err) => reject(createError.InternalServerError(err.message)));
    });
  });
};

export {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
