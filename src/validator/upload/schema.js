const Joi = require('joi');

const ImageHeaderSchema = Joi.object({
  // eslint-disable-next-line max-len
  'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required(),
}).unknown();

module.exports = ImageHeaderSchema;
