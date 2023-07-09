/* eslint-disable max-len */
/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // to make sure table had unique combination
  pgm.addConstraint('collaborations', 'unique_playlist_user_id', 'UNIQUE(playlist_id, user_id)');

  // adding foreign key (playlist_id, user_id)
  pgm.addConstraint('collaborations', 'fk_collaboration_playlist', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  pgm.addConstraint('collaborations', 'fk_collaboration_user', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
