/* eslint-disable max-len */
/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
    },
    album_id: {
      type: 'VARCHAR(50)',
    },
  });

  // adding fk to table
  pgm.addConstraint('likes', 'fk_user_likes', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('likes', 'fk_album_likes', 'FOREIGN KEY(album_id) REFERENCES album(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'fk_user_likes');
  pgm.dropConstraint('likes', 'fk_album_likes');

  pgm.dropTable('likes');
};

