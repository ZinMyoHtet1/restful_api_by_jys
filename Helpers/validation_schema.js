import Joi from "@hapi/joi";

const userLoginValidation = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
});

const userRegisterValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
});

const productSchemaValidation = Joi.object({
  name: Joi.string().lowercase().required(),
  price: Joi.number().required(),
  currency: Joi.string().uppercase().required(),
  madeIn: Joi.string().lowercase(),
  description: Joi.string(),
});

const receiver = Joi.object({
  email: Joi.string().email().required(),
  profile_name: Joi.string().required(),
  sending_option: Joi.string(),
});

const attachment = Joi.object({
  filename: Joi.string().required(),
  path: Joi.string().required(),
  contentDisposition: Joi.string(),
  cid: Joi.string(),
  contentType: Joi.string(),
});

// {
//   "filename": "image1",
//   "path": "./Images/image1.jpg",
//   "contentDisposition": "inline",
//   "cid": "image1",
//   "contentType": "image/jpg"
// }

const mailerValidation = Joi.object({
  to: Joi.alternatives().try(receiver, Joi.array().items(receiver)).required(),
  subject: Joi.string().max(40),
  text: Joi.string(),
  html: Joi.string(),
  attachments: Joi.alternatives().try(
    attachment,
    Joi.array().items(attachment)
  ),
});

export {
  userRegisterValidation,
  userLoginValidation,
  productSchemaValidation,
  mailerValidation,
};
