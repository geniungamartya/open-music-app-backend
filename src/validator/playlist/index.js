const InvariantError = require('../../exceptions/InvariantError');
const {
  PostPlaylistPayloadSchema,
  PostSongsPlaylistPayloadSchema,
  DeleteSongsPlaylistPayloadSchema,
} = require('./schema');

const PlaylistValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePostSongsPlaylistPayload: (payload) => {
    const validationResult = PostSongsPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateDeleteSongsPlaylistPayload: (payload) => {
    const validationResult = DeleteSongsPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
