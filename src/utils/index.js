/* eslint-disable camelcase */
const mapDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapDBToModelGetAlbum = ({
  id,
  name,
  year,
  cover_url,
}) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
});

module.exports = {
  mapDBToModel,
  mapDBToModelGetAlbum,
};
