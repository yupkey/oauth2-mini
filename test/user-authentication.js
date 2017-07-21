const jwt = require('jsonwebtoken');

/**
 * Class representing UserAuthentication
 * @example
 * //Instance of UserAuthentication class is using as a param for oauth2-mini module
 * const OAuthServer = require('oauth2-mini');
 * const userAuthentication = require('./user-authentication');
 * app.oauth = new OAuthServer(userAuthentication);
 */
class UserAuthentication {
  constructor() {
    /**
     * secretKey
     * used to generate access token
     * Read more here: https://www.npmjs.com/package/jsonwebtoken
     */
    this.secretKey = 'secret';
    /**
     * jwtOptions
     * can be used to generate access token with additional options
     */
    this.jwtOptions = {
      expiresIn: 60 * 60
    };
  }
  /**
   * Check user credentials
   * @param {string} clientId
   * @param {string} clientSecret
   * @param {successCallback} success
   * @param {errorCallback} error
   * @callback successCallback
   * @callback errorCallback
   */
  checkUserCredentials(clientId, clientSecret, success, error) {
    if (clientId === 'login' && clientSecret === 'password') {
      success();
    } else {
      error('Invalid credentials');
    }
  }
  /**
   * Save access token
   * @param {string} accessToken
   * @param {successCallback} success
   * @param {errorCallback} error
   */
  checkAccessToken(accessToken, success, error) {
    jwt.verify(accessToken, this.secretKey, (err, decoded) => {
      if (err) {
        error(err);
      } else {
        success();
      }
    });
  }
  /**
   * Check access token
   * @param {string} accessToken
   * @param {successCallback} success
   * @param {errorCallback} error
   */
  saveAccessToken(accessToken, success, error) {
    success();
  }
}
module.exports = new UserAuthentication();
