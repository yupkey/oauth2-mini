const jwt = require('jsonwebtoken');

/**
 * Class representing OAuthServer
 * @example
 * const oauthserver = require('oauth2-mini');
 * const userAuthentication = require('./user-authentication');
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
 *   constructor () {
 *      this.secretKey = 'your-secret-key';
 *      this.jwtOptions = { expiresIn: 60 * 60 };
 *   }
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
   * @param {string} config.secretKey - secret ket to sign the token
   * @param {object} config.jwtOptions - https://www.npmjs.com/package/jsonwebtoken
   * @param {function} config.checkUserCredentials - method for checking user
   * credential send in the headers 'Basic base64(login:password)'
   * @param {function} config.saveAccessToken - method for saving access token
   * @param {function} config.checkAccessToken - method for checking access token
   */
  constructor(config) {
    config = config || {};
    this.secretKey = config.secretKey || 'secret';
    this.jwtOptions = config.jwtOptions || null;
    this.checkUserCredentials = config.checkUserCredentials || this._checkUserCredentials;
    this.saveAccessToken = config.saveAccessToken || this._saveAccessToken;
    this.checkAccessToken = config.checkAccessToken || this._checkAccessToken;
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
        this.checkUserCredentials(clientId, clientSecret, (data) => {
          this.sendToken(data);
        }, (err) => {
          this.sendError(err);
        });
      });

    };
  }

  /**
   * Authorize the access
   *
   * @example
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
      return this.sendError('Unauthorized access! Must be method POST and Content-Type: application/x-www-form-urlencoded');
    }

    let authorization = this.req.headers.authorization;
    if (!authorization) {
      return this.sendError('Unauthorized access!');
    }

    let err = 'Invalid credentials';
    authorization = authorization.split(' ');
    if (authorization[0] !== 'Basic' || !authorization[1]) {
      return this.sendError(err);
    }

    let credentials = this.encode(authorization[1]).split(':');
    let clientId = credentials[0];
    let clientSecret = credentials[1];

    if (!clientId || !clientSecret) {
      return this.sendError(err);
    }

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
    console.log(`Create own method 'checkUserCredentials'!`);
    error('Authentication fail!');
  }

  /**
   * Get access token
   */
  getAccessToken() {
    let authorization = this.req.headers.authorization;
    let err = 'Unauthorized access!';
    if (!authorization) {
      return this.sendError(err);
    }

    authorization = authorization.split(' ');
    let accessToken = authorization[1];

    if (authorization[0] !== 'Bearer' || !accessToken) {
      return this.sendError(err);
    }

    this.checkAccessToken(accessToken, () => {
      return this.next();
    }, (er) => {
      return this.sendError(er || err);
    });
  }

  /**
   * Check access token
   * @param {string} accessToken
   * @param {successCallback} success
   * @param {errorCallback} error
   */
  _checkAccessToken(accessToken, success, error) {
    console.log(`Create own method 'checkAccessToken' to authorize the user!`);
    error('Unauthorized!');
  }

  /**
   * Generate a token
   * https://www.npmjs.com/package/jsonwebtoken
   *
   * @param {object} data
   * @return {string} token
   *
   */
  generateToken(data) {
    return jwt.sign({
      data: JSON.stringify(data) || 'access_token'
    }, this.secretKey, this.jwtOptions);
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
  sendError(err, req, res, next) {
    res = res || this.res;
    let _err = {
      error_code: err && err.code ? err.code : 401,
      error_message: err && err.message ? err.message : err || 'Error server'
    };
    res.status(_err.error_code).send(_err);
  }

  /**
   * Save access token
   * @param {string} accessToken
   * @param {successCallback} success
   * @param {errorCallback} error
   */
  _saveAccessToken(accessToken, success, error) {
    console.log(`Create own method 'saveAccessToken' to store your token!`);
    error('Unauthorized!');
  }

  /**
   * Send access token
   * @param {object} data data pass by `checkAccessToken` in successCallback
   */
  sendToken(data) {
    let accessToken = this.generateToken(data);
    this.saveAccessToken(accessToken, () => {
      this.res.send({
        token_type: 'bearer',
        access_token: accessToken,
        data: data || null
      });
    }, (err) => {
      this.sendError(err);
    });
  }
}

module.exports = OAuthServer;
