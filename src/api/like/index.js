const LikeHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'like',
  version: '1.0.0',
  register: async (server, {likeService, albumService}) => {
    const likeHandler = new LikeHandler(likeService, albumService);
    server.route(routes(likeHandler));
  },
};
