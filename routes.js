var 
  fs = require('fs'),
  nt = require('nt'),
  request = require('request'),
  crypto = require('crypto'),
  JSX = require('node-jsx').install(),
  React = require('react'),
  Seed = require('./components/Seedbox/Seed.react');
  Betaserie = require('./components/Betaserie/Betaserie.react');
  Menu = require('./components/Menu/Menu.react');

  hote = require('./config/freebox.js'),
  freebox = require('./config/app.js'),
  betaserie = require('./config/betaserie.js'),

  SeedBox = require('freebox-os-client')(hote),
  BetaSerie = new (require('betaseries'))(betaserie.api_key);
  Kickass = require('kickass-simple-search');

  module.exports = app = {
  connectApp:function(req, res){
    SeedBox.getChallenge(null, null, null, function(response) {
        if (response.success) {
            var param = {
                app_id: freebox.app_id,
                app_version: freebox.app_version,
                password: crypto.createHmac('sha1', freebox.app_token).update(response.result.challenge).digest('hex')
            };
            SeedBox.openSession(null,param,null,function(response){
                if (response.success) {
                  req.session.apptoken=response.result.session_token;
                  res.redirect('/');
                }
            });
        }
    });
  },
  connectBetaSerie:function(req, res, user){
    var auth = BetaSerie.Auth, 
        nbUser = betaserie.users.length,
        connectedUser = 0;
        req.session.users = [];

    betaserie.users.forEach(function(user, i){
      auth.login(user.login,crypto.createHash("md5").update(user.password).digest("hex"), function(response) {
          req.session.users.push({
            name : user.name,
            token : response.token
          });
          connectedUser++;
          console.log("user",connectedUser,nbUser);
          if(connectedUser===nbUser){
            req.session.gotUsers=true;
            res.redirect('/');
          }
      });
    });
  },
  getDownloads: function(req, res){
    SeedBox.getAllDownloads(null,null,req.session.apptoken,function(response){
      if(response.success){
        req.session.downloads = response.result ? response.result : 1;
        res.redirect('/');
      }
    });
  },
  getShows: function(req, res){
    var episodes = BetaSerie.Episodes, nbUser = betaserie.users.length, nbShows = 0;
    req.session.users.forEach(function(user, i){
      episodes.all(user.token,null,null,4,null,function(shows){
          req.session.users[i].shows = shows;
          nbShows++;
          console.log("shows",nbShows,nbUser);
          if(nbShows===nbUser){
            req.session.gotShows=true;
            res.redirect('/');
          }
      });
    });
  },
  listen: function(io, req, res){
    setInterval(function () {
      SeedBox.getAllDownloads(null,null,req.session.apptoken,function(response,err){
        if(response.success){
            var downloads = response.result;
            io.sockets.emit('downloads', downloads);
        }
      });
    }, 1000);

    io.sockets.on('connection', function (socket) {

      socket.on('change', function (download) {
        if(download.status==="downloading"||download.status==="seedBoxing")
          bodyParam={'status':'stopped'};
        else
          bodyParam={'status':'downloading'};
        SeedBox.updateDownload({'id':download.id},bodyParam,req.session.apptoken);
      });

      socket.on('delete', function (download) {
        SeedBox.deleteDownload({'id':download.id},null,req.session.apptoken);
      });

      socket.on('reboot', function () {
        SeedBox.reboot(null,null,req.session.apptoken);
      });

      socket.on('changeSpeed', function (speed) {
        SeedBox.changeSpeed(null,speed,req.session.apptoken, function(res){
          if(res.success)
            io.sockets.emit('speedChanged');
        });
      });

      socket.on('getTorrent', function (episode) {
        Kickass.search(episode.name, function(res){
          var path, bodyParam;
          nt.read(res.list[0].torrentLink, function(err, torrent) {
            if (err) throw err;
            path = __dirname + "/files/"+episode.key+".torrent";
            console.log("path created",path);
            torrent.createWriteStreamWatch(path).on('close',function(){
              console.log("torrent created",path);
              bodyParam = { form: true, formData: { download_file: fs.createReadStream(path) } };
              SeedBox.addDownload(null,bodyParam,req.session.apptoken,function(res){
                console.log("torrent added",path,res);
                val = res.error_code === "exists" ? "exists" : "added";
                io.sockets.emit('changeState'+episode.key, val);
                fs.unlink(path);
                console.log("torrent file removed",path);
              });
            });
          });
        }, function(err){
          io.sockets.emit('changeState'+episode.key, "unfound");
        });
      });
    });
  },
  home: function(io) {
    return function(req, res){

      // connect to APIs and fetch data
      if(!req.session.apptoken){ 
          app.connectApp(req,res);
      }else if(!req.session.gotUsers){
          app.connectBetaSerie(req,res);
      }else if(!req.session.gotShows){ 
          app.getShows(req,res);
      }else if(!req.session.downloads){
          app.getDownloads(req,res);
      }else{

        // Server rendering
        var downloads = req.session.downloads,
            users = req.session.users,
              
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

            // Updates in real time
            app.listen(io, req, res);
      }
    }
  },
  logout: function(req, res) {
    Seed.closeSession(null,null,req.session.apptoken,function(response){
      if (response.success) {
          req.session.apptoken=""; 
          res.redirect('/');
      }
    });
  }
}