const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistService {
  constructor(collaborationService, cacheService) {
    this._cacheService = cacheService;
    this.pool = new Pool();
    this._collaborationService = collaborationService;
  };

  async addPlaylist({name, owner}) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO playlists VALUES($1, $2, $3) RETURNING id;`,
      values: [id, name, owner],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add playlist');
    };

    await this._cacheService.delete(`playlist:${owner}`);

    return result.rows[0].id;
  };

  async addSongsPlaylist(playlistId, songId, owner) {
    const id = `song_playlist-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO song_to_playlist 
      VALUES($1, $2, $3) 
      RETURNING id`,
      values: [id, playlistId, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('failed to add song to playlist');
    };

    await this._cacheService.delete(`playlist:${owner}`);
    await this._cacheService.delete(`songplaylist:${playlistId}`);

    return result.rows[0].id;
  }

  async verifySongId(songId) {
    const query = {
      text: `SELECT id FROM song WHERE id = $1`,
      values: [songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('SongId not found');
    }
  }

  async getPlaylist(owner) {
    try {
      const result = await this._cacheService.get(`playlist:${owner}`);
      const parsing = JSON.parse(result);
      return {
        cache: true,
        playlists: parsing,
      };
    } catch (error) {
      const query = {
        text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        INNER JOIN users
        ON playlists.owner = users.id
        WHERE playlists.owner = $1
        UNION
        SELECT playlists.id, playlists.name, users.username
        FROM collaborations
        INNER JOIN playlists
        ON collaborations.playlist_id = playlists.id
        INNER JOIN users
        ON playlists.owner = users.id
        WHERE collaborations.user_id = $1`,
        values: [owner],
      };

      const result = await this.pool.query(query);
      const playlists = result.rows;

      await this._cacheService.set(
          `playlist:${owner}`,
          JSON.stringify(playlists),
      );

      return {playlists};
    };
  };

  async getSongsPlaylist(playlistId) {
    try {
      const result = await this._cacheService.get(`songplaylist:${playlistId}`);
      const parsing = JSON.parse(result);
      return {
        cache: true,
        playlist: parsing,
      };
    } catch (error) {
      const songQuery = {
        text: `
        SELECT song.id, song.title, song.performer
        FROM song
        INNER JOIN song_to_playlist As rel
        ON rel.song_id=song.id
        WHERE rel.playlist_id = $1`,
        values: [playlistId],
      };
      const playlistQuery = {
        text: `SELECT playlists.id, playlists.name, users.username
        FROM playlists
        INNER JOIN users
        ON playlists.owner = users.id
        WHERE playlists.id = $1`,
        values: [playlistId],
      };
      const songs = await this.pool.query(songQuery);
      const playlist = await this.pool.query(playlistQuery);

      const data = playlist.rows[0];
      data.songs = songs.rows;

      const response = playlist.rows[0];

      await this._cacheService.set(
          `songplaylist:${playlistId}`,
          JSON.stringify(response),
      );

      return {playlist: response};
    };
  };

  async deletePlaylistById(id, owner) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('playlist not found');
    };

    await this._cacheService.delete(`playlist:${owner}`);
    await this._cacheService.delete(`songplaylist:${id}`);
  };

  async deleteSongPlaylist(id, songId, owner) {
    const query = {
      text: `DELETE
      FROM song_to_playlist
      WHERE playlist_id = $1 AND song_id = $2
      RETURNING id`,
      values: [id, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('playlist not found');
    };

    await this._cacheService.delete(`playlist:${owner}`);
    await this._cacheService.delete(`songplaylist:${id}`);
  };

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: `SELECT * FROM playlists WHERE id = $1`,
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Access Forbiden');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      };

      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      };
    };
  };
  // checking playlist with id
  async isPlaylist(playlistId) {
    const query = {
      text: `
        SELECT id
        FROM playlists
        WHERE id = $1`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('activity not found');
    }
  };
};

module.exports = PlaylistService;
