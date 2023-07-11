class UploadHandler {
  constructor(service, validator, albumService) {
    this._service = service;
    this._validator = validator;
    this._albumService = albumService;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    const {cover} = request.payload;
    const {id} = request.params;
    this._validator.validateImageHeader(cover.hapi.headers);

    await this._albumService.getAlbumById(id);
    const filename = await this._service.writeFile(cover, cover.hapi);

    filepath = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
    await this._albumService.addCoverUrlAlbum(id, filepath);

    const response = h.response({
      status: 'success',
      message: 'Cover uploaded successfully',
      data: {
        fileLocation: filepath,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadHandler;
