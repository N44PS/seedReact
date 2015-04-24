var 
  Q = require('q'),
  fs = require('fs'),
  crypto = require('crypto'),
  nt = require('nt'),

  Kickass = require('kickass-simple-search'),

  hote = require('./config/freebox.js'),
  freebox = require('./config/app.js'),
  betaserie = require('./config/betaserie.js'),

  JSX = require('node-jsx').install(),
  React = require('react'),

  Seed = require('./components/Seedbox/Seed.react'),
  Betaserie = require('./components/Betaserie/Betaserie.react'),
  Menu = require('./components/Menu/Menu.react'),
  
  SeedBox = require('freebox-os-client')(hote),
  BetaSerie = new (require('betaseries'))(betaserie.api_key),

  pathDownloads = __dirname + "/files/downloads.json",
  pathUsers = __dirname + "/files/users.json";

  // PUBLIC FUNCTIONS

  module.exports = app = {

    openSession: function () {
      var deferred = Q.defer(), users = betaserie.users, promises = [];

      users.forEach(function (user) {
        promises.push(getUser(user));
      });

      var logins = Q.all(promises),
          seedbox = getChallenge(freebox).then(openSession),
          result = Q.all([logins, seedbox]).spread(function (logins, seedbox) {
            var res = {
              user: logins,
              app: seedbox
            }
            deferred.resolve(res);
          });
      return deferred.promise;
    },

    getData: function () {
      var deferred = Q.defer(), promises = [];
      promises.push(Q.nfcall(fs.readFile, pathDownloads, 'utf8'));
      promises.push(Q.nfcall(fs.readFile, pathUsers, 'utf8'));

      Q.all(promises).spread(function (downloads, users) {
          data = {
            downloads: JSON.parse(downloads),
            users: JSON.parse(users)
          }
          deferred.resolve(data);
      });
      return deferred.promise;
    },

    listen: function (io, session) {
      io.sockets.on('connection', function (socket) {
        
        SeedBox.getAllDownloads(null, null, session.token, function (res) {
            var downloads = res.result ? res.result : 1;
            fs.writeFileSync(pathDownloads, JSON.stringify(downloads));
        });

        getShows(session.users).then(function (users) {
          fs.writeFileSync(pathUsers, JSON.stringify(users));
          io.emit('gotUsers', users);
        });

        socket.on('change', function (download) {
          var param = {};
          if(download.status === "downloading" || download.status === "seedBoxing") {
            param.status = "stopped";
          } else {
            param.status = "downloading";
          }
          SeedBox.updateDownload({'id':download.id}, param, session.token);
        });

        socket.on('delete', function (download) {
          SeedBox.deleteDownload({'id':download.id}, null, session.token);
        });

        socket.on('reboot', function () {
          SeedBox.reboot(null, null, session.token);
        });

        socket.on('changeSpeed', function (speed) {
          SeedBox.changeSpeed(null, speed, session.token, function (res) {
            if(res.success)
              io.emit('speedChanged');
          });
        });

        socket.on('getTorrent', function (search) {
          addDownload(search, session.token, function (download) {
            io.sockets.emit('changeState'+ download.name, download.val);
            fs.unlink(download.path);
          });
        });

      });

      setInterval(function () {
        SeedBox.getAllDownloads(null, null, session.token, function (res) {
            var downloads = res.result ? res.result : 1;
            io.emit('downloads', downloads);
        });
      }, 1000);
    },

    render: function (res, users, downloads) {
      markup = React.renderComponentToString(
        Menu({}),
        Betaserie({users: users}),
        Seed({downloads: downloads})
      );

      res.render('home', {
        markup: markup, 
        downloads: JSON.stringify(downloads),
        users: JSON.stringify(users)
      });
    }

  };

  // PRIVATE FUNCTIONS

  // Freebox

  var getChallenge = function (freebox) {
    var deferred = Q.defer();
    SeedBox.getChallenge(null, null, null, function (res) {
      var param = {
          app_id: freebox.app_id,
          app_version: freebox.app_version,
          password: crypto.createHmac('sha1', freebox.app_token).update(res.result.challenge).digest('hex')
      };
      deferred.resolve(param);
    });
    return deferred.promise;
  },

  openSession = function (param) {
    var deferred = Q.defer();
    SeedBox.openSession(null, param, null, function (res) {
        deferred.resolve(res.result.session_token);
    });
    return deferred.promise;
  },

  // Betaseries

  getUser = function (user) {
    var deferred = Q.defer(), auth = BetaSerie.Auth, User = user;
    auth.login(user.login, crypto.createHash("md5").update(user.password).digest("hex"), function (res) {
      var user = {
        name: User.name,
        token: res.token
      };
      deferred.resolve(user);
    });
    return deferred.promise;
  },

  getShow = function (user) {
    var deferred = Q.defer(), episodes = BetaSerie.Episodes, User = user;
    episodes.all(user.token, null, null, 4, null, function (shows) {
        User.shows = shows;
        deferred.resolve(User);
    });
    return deferred.promise;
  },

  getShows = function (users) {
    var deferred = Q.defer(), promises = []; 
    users.forEach(function (user) {
      promises.push(getShow(user));
    });
    var shows = Q.all(promises).then(function (users) {
      deferred.resolve(users);
    });
    return deferred.promise;
  },

  // Actions

  getLink = function (search) {
    var deferred = Q.defer();
    Kickass.search(search.name, function (res) {
      deferred.resolve(res.list[0].torrentLink);
    });
    return deferred.promise;
  },

  readTorrent = function (link) {
    var deferred = Q.defer();
    nt.read(link, function (err, data) {
      if (err) deferred.reject(err);
      deferred.resolve(data);
    });
    return deferred.promise;
  },

  createFile = function (file) {
    var deferred = Q.defer(), path = __dirname + "/files/torrents/" + file.name + ".torrent", data = file.data;
    data.createWriteStream(path).on('close', function () {
      deferred.resolve(path);
    });
    return deferred.promise;
  },

  addFile = function (opts) {
    var deferred = Q.defer();
    var params = { 
        form: true, 
        formData: { 
          download_file: fs.createReadStream(opts.path) 
        } 
    };
    SeedBox.addDownload(null, params, opts.token, function (res) {
      var val = res.error_code === "exists" ? "exists" : "added";
      deferred.resolve(val);
    });
    return deferred.promise;
  },

  addDownload = function (search, token, callback) {
    var download = {};
    download.name = search.key;
    getLink(search).then(readTorrent).then(function (data) {
      var file = { data: data, name: download.name };
      return createFile(file);
    }).then(function (path) {
      download.path = path;
      var opts = { path: path, token: token };
      return addFile(opts);
    }).then(function (val) {
      download.val = val;
      callback(download);
    });
  };