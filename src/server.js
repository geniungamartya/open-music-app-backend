// Hapi
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

// plugin
const album = require('./api/album');
const song = require('./api/song');
const playlist = require('./api/playlist');
const collaboration = require('./api/collaboration');
const activity = require('./api/activity');
const _export = require('./api/export');
const upload = require('./api/upload');
const like = require('./api/like');

// service
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const CollaborationService = require('./services/postgres/CollabolrationsService');
const ActivityService = require('./services/postgres/ActivitiesService');
const ProducerService = require('./services/rabbitmq/ProducerSevice');
const StorageService = require('./services/storage/StorageService');
const CacheService = require('./services/redis/CacheService');
const LikeService = require('./services/postgres/LikesService');

// validator
const AlbumsValidator = require('./validator/album');
const SongValidator = require('./validator/song');
const PlaylistValidator = require('./validator/playlist');
const CollaborationValidator = require('./validator/collaboration');
const ExportValidator = require('./validator/export');
const UploadValidator = require('./validator/upload');

// database
require('dotenv').config();

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// error handler
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const cacheService = new CacheService();
  const albumService = new AlbumsService(cacheService);
  const songService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationService = new CollaborationService();
  const activityService = new ActivityService();
  const playlistService = new PlaylistsService(collaborationService, cacheService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/upload/file/images'));
  const likeService = new LikeService(cacheService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        playlistService,
        validator: PlaylistValidator,
        activityService,
      },
    },
    {
      plugin: collaboration,
      options: {
        collaborationService,
        playlistService,
        usersService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: activity,
      options: {
        activityService,
        playlistService,
      },
    },
    {
      plugin: _export,
      options: {
        service: ProducerService,
        validator: ExportValidator,
        playlistService,
      },
    },
    {
      plugin: upload,
      options: {
        service: storageService,
        validator: UploadValidator,
        albumService,
      },
    },
    {
      plugin: like,
      options: {
        likeService,
        albumService,
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
