# oauth2-mini

OAuth2 mini server

## Instalation
`npm install oauth2-mini`


## Examples
```javascript
const OAuthServer = require('oauth2-mini');
const userAuthentication = require('./user-authentication');

app.oauth = new OAuthServer(userAuthentication);

//expecting header `Authorization: Basic <base64(login:password)>`
app.all('/token', app.oauth.authenticate());

//expecting header `Authorization: Bearer <accesssToken>`
app.use('/api', app.oauth.authorise(), (req, res) => {
  res.json({message: 'Welcome to API'});
});

app.use(app.oauth.errorHandler());

```

It's required to write own class to authenticate the user and check the token

User authentication example code:
```javascript
class UserAuthentication {
  constructor() {
    /**
     * secretKey and jwtOptions are used to generate your access token
     * Read more here: https://www.npmjs.com/package/jsonwebtoken
     */
    this.secretKey = 'your-secret-key';
    this.jwtOptions = { expiresIn: 60 * 60 }; // default: null
  }
  checkUserCredentials(username, password, success, error) {
    //check credentials here
  }
  checkAccessToken(accessToken, success, error) {
    //check access token here
  }
  saveAccessToken(accessToken, success, error) {
    //save access token to your DB here
  }
}

module.exports = new UserAuthentication();
```
