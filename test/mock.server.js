import express from 'express';
import OAuthServer from './../lib/oauth2-mini';
import userAuthentication from './user-authentication';

const app = express();
const oauth = new OAuthServer(userAuthentication);
app.oauth = oauth;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,X-Requested-With,Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.all('/login', app.oauth.authenticate());
app.all('/api', app.oauth.authorise(), (req, res) => {
  res.json({message: 'Welcome to API'});
});
app.use(oauth.errorHandler());

module.exports = app;
