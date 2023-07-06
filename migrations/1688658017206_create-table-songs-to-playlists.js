/* eslint-disable max-len */
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('song_to_playlist', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
    },
    song_id: {
      type: 'VARCHAR(50)',
    },
  });

  // adding constraint for foreign key
  pgm.addConstraint('song_to_playlist', 'fk_playlist_id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  pgm.addConstraint('song_to_playlist', 'fk_song_id', 'FOREIGN KEY(song_id) REFERENCES song(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // droping constraint
  pgm.dropConstraint('song_to_playlist', 'fk_playlist_id');
  pgm.dropConstraint('song_to_playlist', 'fk_song_id');

  pgm.dropTable('song_to_playlist');
};
