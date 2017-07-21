import request from 'supertest';
import should from 'should';
import jwt from 'jsonwebtoken';
import app from './mock.server';


describe('OAuthServer', () => {
  describe('authenticate()', (done) => {
    it(`it should have secretKey property`, (done) => {
      app.oauth.should.have.property('secretKey').and.be.a.String();
      done();
    });

    it(`it should have jwtOptions property`, (done) => {
      app.oauth.should.have.property('jwtOptions');
      done();
    });

    it(`it should get status 401, method POST, without content-type: application/x-www-form-urlencoded /login`, (done) => {
      request(app)
				.post('/login')
        .send({})
        .set('Authorization', 'Basic bG9naW46cGFzc3dvcmQ')
				.expect(401, done);
    });

    it(`it should get status 401, method POST with wrong credentials, /login`, (done) => {
      request(app)
				.post('/login')
        .send({})
        .set('Authorization', 'Basic wrongcredentials')
        .set('Content-Type', 'application/x-www-form-urlencoded')
				.expect(401, done);
    });

    it(`it should get status 401, method GET with correct credentials  /login`, (done) => {
      request(app)
				.get('/login')
        .send({})
        .set('Authorization', 'Basic bG9naW46cGFzc3dvcmQ')
        .set('Content-Type', 'application/x-www-form-urlencoded')
				.expect(401, done);
    });

    it(`it should get status 200, method POST with correct credentials  /login`, (done) => {
      request(app)
				.post('/login')
        .send({})
        .set('Authorization', 'Basic bG9naW46cGFzc3dvcmQ')
        .set('Content-Type', 'application/x-www-form-urlencoded')
				.expect(200, done);
    });
  });

  describe('authorise()', (done) => {
    it(`it should get status 401, method GET Unauthorized access, without token /api`, (done) => {
      request(app)
      .get('/api')
      .expect(401, done);
    });

    it(`it should get status 401, method GET Unauthorized access, with wrong token /api`, (done) => {
      let token = jwt.sign({}, 'wrong-key');
      request(app)
				.get('/api')
        .set('Authorization', 'Bearer ' + token)
				.expect(401, done);
    });

    it(`it should get status 200, method GET /api`, (done) => {
      let token = jwt.sign({}, 'secret');
      request(app)
				.get('/api')
        .set('Authorization', 'Bearer ' + token)
				.expect(200, done);
    });

    it(`it should get status 200, method POST /api`, (done) => {
      let token = jwt.sign({}, 'secret');
      request(app)
				.post('/api')
        .send({data: 'test'})
        .set('Authorization', 'Bearer ' + token)
				.expect(200, done);
    });

    it(`it should get status 200, method DELETE /api`, (done) => {
      let token = jwt.sign({}, 'secret');
      request(app)
				.delete('/api')
        .send({id: 'test'})
        .set('Authorization', 'Bearer ' + token)
				.expect(200, done);
    });

    it(`it should get status 200, method PUT /api`, (done) => {
      let token = jwt.sign({}, 'secret');
      request(app)
				.put('/api')
        .send({data: 'test'})
        .set('Authorization', 'Bearer ' + token)
				.expect(200, done);
    });

  });
});
