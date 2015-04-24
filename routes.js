var app = require('./app');

module.exports = routes = {
  home: function(io) {
    return function(req, res) {

      if(!req.session.token) { // Create a new session

        app.openSession().then(function (tokens){
          req.session.token = tokens.app;
        }).then(app.getData).then(function(data){
          req.session.downloads = data.downloads;
          req.session.users = data.users;
          app.listen(io, req.session); // Open connection and update data
          res.redirect('/');
        });

      }else { // Render

        var users = req.session.users, downloads = req.session.downloads;
        app.render(res, users, downloads);

      }
    }
  }
}