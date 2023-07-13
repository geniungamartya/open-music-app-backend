class LikeHandler {
  constructor(likeService, albumService) {
    this._likeService = likeService;
    this._albumService = albumService;

    this.getLikeAlbumHandler = this.getLikeAlbumHandler.bind(this);
    this.postLikeAlbumHandler = this.postLikeAlbumHandler.bind(this);
    this.deleteLikeAlbumHandler = this.deleteLikeAlbumHandler.bind(this);
  }

  async postLikeAlbumHandler(request, h) {
    const {id: credentialId} = request.auth.credentials;
    const {id} = request.params;

    await this._albumService.getAlbumById(id);
    const message = await this._likeService.likeAlbum(credentialId, id);

    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);
    return response;
  }

  async getLikeAlbumHandler(request, h) {
    const {id} = request.params;
    await this._albumService.getAlbumById(id);

    const {cache, likes} = await this._likeService.getLike(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    if (cache) response.header('X-Data-Source', 'cache');
    return response;
  }

  async deleteLikeAlbumHandler(request, h) {
    const {id: credentialId} = request.auth.credentials;
    const {id} = request.params;

    await this._albumService.getAlbumById(id);
    console.log(id);
    const message = await this._likeService.deleteLike(credentialId, id);

    const response = h.response({
      status: 'success',
      message,
    });
    return response;
  }
}

module.exports = LikeHandler;
