const ImageHeaderSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UploadValidator = {
  validateImageHeader: (headers) => {
    const validationResult = ImageHeaderSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadValidator;
