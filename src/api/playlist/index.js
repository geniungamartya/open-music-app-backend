const routes = require('./routes');
const PlaylistHandler = require('./handler');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (server, {
    playlistService,
    validator,
    activityService,
  }) => {
    const playlistHandler = new PlaylistHandler(
        playlistService,
        validator,
        activityService,
    );
    server.route(routes(playlistHandler));
  },
};
