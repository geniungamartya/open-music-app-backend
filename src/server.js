const Hapi = require('@hapi/hapi');

// plugin
const album = require('./api/album');
const song = require('./api/song');

// service
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');

// validator
const AlbumsValidator = require('./validator/album');
const SongValidator = require('./validator/song');

// database
require('dotenv').config();

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumService = new AlbumsService();
  const songService = new SongsService();
  const usersService = new UsersService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: album,
      options: {
        service: albumService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: song,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const {response} = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });

        newResponse.code(response.statusCode);
        return newResponse;
      };

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'There is error on server',
      });

      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();

  console.log(`Server running at ${server.info.uri}`);
};

init();
