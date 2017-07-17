# oauth2-mini

OAuth2 mini server

## Instalation
`npm install oath2-mini`

## Examples
```javascript
const OAuthServer = require('oauth2-mini');
const userAuthentication = require('./user-authention');

app.oauth = new OAuthServer(userAuthentication);

//expecting header `Authorization: Basic <base64(login:password)>`
app.all('/token', app.oauth.authenticate());

//expecting header `Authorization: Bearer accesssToken`
app.use('/secret', app.oauth.authorise(), require('./routes/secret'));

app.use(app.oauth.errorHandler());

```
It's required to write own class to authenticate user and check the token

User authentication example code:
```javascript
class UserAuthentication {
  constructor(){}
  checkUserCredentials(clientId, clientSecret, success, error) {
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
