class ActivityHandler {
  constructor(activityService, playlistService) {
    this._playlistsService = playlistService;
    this._activitiesService = activityService;

    this.getActivitiesHandler = this.getActivitiesHandler.bind(this);
  }

  async getActivitiesHandler(request) {
    const {id: credentialId} = request.auth.credentials;
    const {id} = request.params;
    await this._activitiesService.isPlaylist(id);

    await this._playlistsService.getPlaylist(credentialId);
    await this._playlistsService.verifyPlaylistOwner(id, credentialId);

    const data = await this._activitiesService.getActivities(id);

    return {
      status: 'success',
      data,
    };
  }
}

module.exports = ActivityHandler;
