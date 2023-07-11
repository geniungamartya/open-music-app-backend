const UploadHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'upload',
  version: '1.0.0',
  register: async (server, {service, validator, albumService}) => {
    const uploadHandler = new UploadHandler(service, validator, albumService);
    server.route(routes(uploadHandler));
  },
};
