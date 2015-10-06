var fs        = require('fs'),
    https     = require('https'),
    express   = require('express'),
    pem       = require('pem'),
    app       = express()
;

var config    = require('./config.js');
app.config    = config.config;


app.ext  = {};
app.data = {};

app.ext.gitstatus = require('./gitstatus.js');









app.config.REPOS = app.config.REPOS.split(";")

if ( app.config.REPOS.length == "" ) {
  console.error("NO REPOSITORY DEFINED");
  process.exit(1);
}

for ( var r = 0; r < app.config.REPOS.length; r++ ) {
  app.config.REPOS[r] = app.config.REPOS[r].split("/");
  app.config.REPOS[r] = {
    "username": app.config.REPOS[r][0],
    "repo"    : app.config.REPOS[r][1],
    "branch"  : app.config.REPOS[r][2],
  }
}

console.log("REPOS:", app.config.REPOS);


app.ext.gitstatus.init(app);







if (!(fs.existsSync(app.config.HTTPS_KEY) && fs.existsSync(app.config.HTTPS_CERT))) {
  console.log("no keys. creating");
  pem.createCertificate({days:365, selfSigned:true, keyBitsize: 4096}, function(err, keys){
    console.log("keys created");
    fs.writeFileSync(app.config.HTTPS_KEY , keys.serviceKey );
    fs.writeFileSync(app.config.HTTPS_CERT, keys.certificate);
    init_db();
  });
} else {
  console.log("keys exists");
  init_db();
}






function init_db() {
  console.log('initializing db');

  function call_next(list, curr, clbk) {
    var len = list.length;
    if (curr == len ) {
      console.log('all repos initialized');
      clbk();
    } else {
      var cdata    = list[curr];
      console.log('initing repo #', curr+1,':', cdata);
      app.ext.gitstatus.update(app, cdata.username, cdata.repo, cdata.branch, function() { call_next(list, curr+1, clbk) } );
    }
  }

  call_next(app.config.REPOS, 0, start_server);
}

function start_server() {
  console.log('starting server on https://' + app.config.IP + ":" + app.config.PORT);

  https.createServer(
    {
      key : fs.readFileSync(app.config.HTTPS_KEY ),
      cert: fs.readFileSync(app.config.HTTPS_CERT)
    }, app)
    .listen(app.config.PORT, app.config.IP);

  app.get('/', 
    function (req, res) {
      res.header('Content-type', 'text/html');
      return res.end('<h1>Hello, Secure World!</h1>');
    }
  );
}
