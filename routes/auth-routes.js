'use strict';

module.exports = (router, models) => {
  let User = models.User;

  let basicHTTP = require(__dirname + '/../lib/basicHTTP.js');
  let jsonParser = require('body-parser').json();

  router.route('/signup')
    .post(jsonParser, (req, res) => {
      User.findOne({username: req.body.username}, (err, user) => {
        if (err) {
          return res.send(err);
        }

        if (user) {
          return res.json({message: 'User Already Exists', user: user});
        }

        if (!user) {
          var newUser = new User(req.body);
          newUser.username = req.body.username;
          newUser.password = req.body.password;
          newUser.save((err, user) => {
            if (err) {
              return res.json({message: 'Error Saving New User', error: err});
            }
            res.status(200).json({token: user.generateToken(), user: user});
          })
        }
      });
    });

  router.route('/login')
    .post(basicHTTP, (req, res) => {
      User.findOne({'username': req.body.username}, (err, user) => {
        if (err) {
          return res.send(err);
        }

        if (!user) {
          return res.status(401).json({message: 'User Not Found'});
        }
        let valid = user.compareHash(req.body.password);

        if (!valid) {
          return res.json({message: 'Authentication Failure'});
        }
        res.status(200).json({token: user.generateToken(), user: user});
      });
    });
};