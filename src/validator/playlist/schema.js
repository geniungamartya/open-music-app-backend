const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongsPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeleteSongsPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongsPlaylistPayloadSchema,
  DeleteSongsPlaylistPayloadSchema,
};
