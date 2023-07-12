class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  };

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const {name = 'untitled', year} = request.payload;
    const albumId = await this._service.addAlbum({name, year});

    const response = h.response({
      status: 'success',
      message: 'album added',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  };

  async getAlbumByIdHandler(request, h) {
    const {id} = request.params;
    const {cache, album} = await this._service.getAlbumById(id);

    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });
    if (cache) response.header('X-Data-Source', 'cache');
    return response;
  };

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const {id} = request.params;
    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album Edited',
    };
  };
  async deleteAlbumByIdHandler(request, h) {
    const {id} = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album deleted',
    };
  };
};

module.exports = AlbumHandler;
