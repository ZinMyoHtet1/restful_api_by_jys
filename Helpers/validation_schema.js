import Joi from "@hapi/joi";

const userSchemaValidation = Joi.object({
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
export { userSchemaValidation, productSchemaValidation };
