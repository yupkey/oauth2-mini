const jwt = require('jsonwebtoken');

/**
 * Class representing OAuthServer
 * @example
 * const oauthserver = require('oauth2-mini');
 * const userAuthentication = require('./user-authention');
 *
 * app.oauth = new oauthserver(userAuthentication);
 *
 * app.all('/token', app.oauth.authenticate());
 *
 * app.use('/secret', app.oauth.authorise(), require('./routes/secret'));
 *
 * app.use(app.oauth.errorHandler());
 *
 * User authentication example code:
 *
 * class UserAuthentication {
 *   constructor(){}
 *   checkUserCredentials(clientId, clientSecret, success, error) {}
 *   checkAccessToken(accessToken, success, error) {}
 *   saveAccessToken(accessToken, success, error) {}
 * }
 * module.exports = new UserAuthentication();
 *
 */
class OAuthServer {
  /**
   * @param {object} config - the config object
   * @param {function} config.checkUserCredentials - method for checking user
   * credential send in the headers 'Basic base64(login:password)'
   * @param {function} config.saveAccessToken - method for saving access token
   * @param {function} config.checkAccessToken - method for checking access token
   */
  constructor(config) {
    this.checkUserCredentials = config && config.checkUserCredentials ? config.checkUserCredentials
      : this._checkUserCredentials;
    this.saveAccessToken = config && config.saveAccessToken ? config.saveAccessToken
      : this._saveAccessToken;
    this.checkAccessToken = config && config.checkAccessToken ? config.checkAccessToken
      : this._checkAccessToken;
  }

  /**
   * Authenticate the user
   *
   * @example
   * //Example usage:
   * app.all('/token', app.oauth.authenticate());
   *
   */
  authenticate() {
    return (req, res, next) => {
      this.req = req;
      this.res = res;
      this.validateCredentials((clientId, clientSecret) => {
        this.checkUserCredentials(clientId, clientSecret, () => {
          this.sendToken();
        }, (err) => {
          this.sendError(err);
        });
      });

    };
  }

  /**
   * Authorize the access
   *
   * Example usage:
   * app.use('/secret', app.oauth.authorise(), require('./routes/secret'));
   *
   */
  authorise() {
    return (req, res, next) => {
      this.req = req;
      this.res = res;
      this.next = next;
      this.getAccessToken();
    };
  }

  /**
   * Encode base64 credentials
   */
  encode(data) {
    return new Buffer(data, 'base64').toString('ascii');
  }

  /**
   * Validate credentials
   * @param {successCallback} success
   * @callback successCallback
   */
  validateCredentials(success) {
    if (this.req.method !== 'POST' || this.req.headers['content-type'] !== ('application/x-www-form-urlencoded')) {
      return this.sendError({message: 'Must be method POST and content-type: application/x-www-form-urlencoded'});
    }
    let authorization = this.req.headers.authorization.split(' ');
    if (authorization[0] !== 'Basic') {
      return this.sendError({message: 'Invalid credentials'});
    }
    let credentials = this.encode(authorization[1]).split(':');
    let clientId = credentials[0];
    let clientSecret = credentials[1];
    //TODO: validate credentials
    success(clientId, clientSecret);
  }

  /**
   * Check user credentials
   * @param {string} clientId
   * @param {string} clientSecret
   * @param {successCallback} success
   * @param {errorCallback} error
   */
  _checkUserCredentials(clientId, clientSecret, success, error) {
    console.log(`Create method 'checkUserCredentials'!`);
    error('Authentication fail!');
  }

  /**
   * Get access token
   */
  getAccessToken() {
    let authorization = this.req.headers.authorization.split(' ');
    if (authorization[0] !== 'Bearer') {
      return this._endError({message: 'Invalid credentials'});
    }
    let accessToken = authorization[1];
    this.checkAccessToken(accessToken, () => {
      return this.next();
    }, (err) => {
      return this.sendError({
        message: err || 'Invalid credentials'
      });
    });
  }

  /**
   * Check access token
   * @param {string} accessToken
   * @param {successCallback} success
   * @param {errorCallback} error
   */
  _checkAccessToken(accessToken, success, error) {
    console.log(`Create method 'checkAccessToken' to authorize the user!`);
    error('Unauthorized!');
  }

  /**
   * Generate a token
   * @return {string} token
   */
  generateToken() {
    return jwt.sign({
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      data: 'access_token'
    }, 'secret');
  }

  /**
   * Error handler
   * @return {method} this.sendError
   */
  errorHandler() {
    return this.sendError;
  }

  /**
   * Send error
   * @param {object|string} err - error message or error object: {code: 401, message: ''}
   */
  sendError(err) {
    let _err = {
      error_code: err && err.code ? err.code : 401,
      error_message: err && err.message ? err.message : err || 'Error server'
    };
    this.res.status(_err.error_code).send(_err);
  }

  /**
   * Save access token
   * @param {string} accessToken
   * @param {successCallback} success
   * @param {errorCallback} error
   */
  _saveAccessToken(accessToken, success, error) {
    console.log(`Create method 'saveAccessToken' to store your token!`);
    error('Unauthorized!');
  }

  /**
   * Send access token
   */
  sendToken() {
    let accessToken = this.generateToken();
    this.saveAccessToken(accessToken, () => {
      this.res.send({
        token_type: 'bearer',
        access_token: accessToken
      });
    }, (err) => {
      this.sendError(err);
    });
  }
}

module.exports = OAuthServer;