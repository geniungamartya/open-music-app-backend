const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class ActivityService {
  constructor() {
    this.pool = new Pool();
  }

  async recordAdd({
    playlistId,
    songId,
    userId,
  }) {
    try {
      const action = 'add';
      await this.addActivity({
        playlistId,
        songId,
        userId,
        action,
      });
    } catch (error) {
      throw error;
    }
  }
  async recordDelete({
    playlistId,
    songId,
    userId,
  }) {
    try {
      const action = 'delete';
      await this.addActivity({
        playlistId,
        songId,
        userId,
        action,
      });
    } catch (error) {
      throw error;
    }
  }
  async addActivity({
    playlistId,
    songId,
    userId,
    action,
  }) {
    const id = `activity-${nanoid(16)}`;
    const timestamp = new Date().getTime().toString();

    const query = {
      text: `
            INSERT INTO activities
            VALUES($1,$2,$3,$4,$5,$6)
            RETURNING id`,
      values: [id, playlistId, songId, userId, action, timestamp],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('action not recorded');
    }
  }
  async isPlaylist(playlistId) {
    const query = {
      text: `
        SELECT id
        FROM activities
        WHERE playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('activity not found');
    }
  }
  async getActivities(playlistId) {
    const query = {
      text: `
        SELECT 
        users.username, 
        songs.title,
        activities.action,
        activities.time
        FROM activities
        INNER JOIN users
        ON activities.user_id = users.id
        INNER JOIN songs
        ON activities.song_id = songs.id
        WHERE activities.playlist_id = $1
        `,
      values: [playlistId],
    };

    const result = await this.pool.query(query);
    const data = {playlistId};
    data.activities = result.rows;

    return data;
  }
}

module.exports = ActivityService;
