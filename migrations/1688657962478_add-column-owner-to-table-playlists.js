/* eslint-disable max-len */
/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('playlists', {
    owner: {
      type: 'VARCHAR(50)',
    },
  });
  // adding user fiktif
  pgm.sql('INSERT INTO users(id, username, password, fullname) VALUES (\'no_user\', \'no_user\', \'no_user\', \'no user\')');

  // fill users data to null owner
  pgm.sql('UPDATE playlists SET owner = \'no_user\' WHERE owner IS NULL');

  // add foreign key (owner) to playlist table
  pgm.addConstraint('playlists', 'fk_playlist_owner', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // deleting user fiktif
  pgm.sql('DELETE FROM users WHERE id = \'no_user\'');

  // set user fiktif to null
  pgm.sql('UPDATE playlists SET owner = NULL WHERE id = \'no_user\'');

  pgm.dropColumn('playlists', 'owner');
};

