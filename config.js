var path = require('path');

var IP                    = process.env.IP                  || process.env.OPENSHIFT_NODEJS_IP   || "0.0.0.0",
    PORT                  = process.env.PORT                || process.env.OPENSHIFT_NODEJS_PORT || 443,
    DATA_DIR              = process.env.DATA_DIR            || process.env.OPENSHIFT_DATA_DIR    || __dirname,

    HTTPS_KEY             = process.env.HTTPS_KEY           || "key.pem",
    HTTPS_CERT            = process.env.HTTPS_CERT          || "cert.pem",

    GITHUB_API_HOST       = process.env.GITHUB_API_HOST     || "api.github.com", //"github.my-GHE-enabled-company.com", // should be api.github.com for GitHub
    GITHUB_PATH_PREFIX    = process.env.GITHUB_PATH_PREFIX  || "", //"/api/v3",        // for some GHEs; none for GitHub
    GITHUB_USER_AGENT     = process.env.GITHUB_USER_AGENT   || "biodocker.gitstatus" // GitHub is happy with a unique user agent

    GITHUB_USER_NAME      = process.env.GITHUB_USER_NAME    || null,
    GITHUB_PASSWORD       = process.env.GITHUB_PASSWORD     || null,
    GITHUB_TOKEN          = process.env.GITHUB_TOKEN        || null,
    GITHUB_OAUTH_KEY      = process.env.GITHUB_OAUTH_KEY    || null,
    GITHUB_OAUTH_SECRET   = process.env.GITHUB_OAUTH_SECRET || null,
    GITHUB_OAUTH_TOKEN    = process.env.GITHUB_OAUTH_TOKEN  || null,
    GITHUB_SLEEP          = process.env.GITHUB_SLEEP        || -1,

    REPOS                 = process.env.REPOS               || "biodocker/containers/master;biodocker/sandbox/master"
;


exports.config = {
  IP                    : IP,
  PORT                  : PORT,

  HTTPS_KEY             : HTTPS_KEY,
  HTTPS_CERT            : HTTPS_CERT,

  REPOS                 : REPOS,

  github                : {
    // required
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    host:       GITHUB_API_HOST,
    pathPrefix: GITHUB_PATH_PREFIX,
    timeout: 5000,
    headers: {
        "user-agent": GITHUB_USER_AGENT,
        "Time-Zone": "Etc/UTC",
        "Accept": "application/vnd.github.v3+json"
    }
  },

  cache                 : {
    dir   : path.join( DATA_DIR, 'storage' ),
    ttl   : 24 * 60 * 60 * 1000, // 1 day
    loggin: true
  }
};



if ( GITHUB_USER_NAME ) {
  exports.config.github_authentication = {
    type    : "basic",
    username: GITHUB_USER_NAME,
    password: GITHUB_PASSWORD
  }
}
else if ( GITHUB_TOKEN ) {
  exports.config.github_authentication = {
    type    : "token",
    token   : GITHUB_TOKEN,
  }
}
else if ( GITHUB_OAUTH_KEY ) {
  exports.config.github_authentication = {
    type    : "oauth",
    key     : GITHUB_OAUTH_KEY,
    secret  : GITHUB_OAUTH_SECRET
  }
}
else if ( GITHUB_OAUTH_TOKEN ) {
  exports.config.github_authentication = {
    type    : "oauth",
    token   : GITHUB_OAUTH_TOKEN,
  }
}




if ( GITHUB_SLEEP == -1 ) {
  if (exports.config.github_authentication) { // authenticated. 5000/hour 83/min 1/720ms
    exports.config.GITHUB_SLEEP = 60.0 * 60.0 * 1000.0 / 5000.0;

  } else { // non authenticated. 60/hour 1/min 1/60000ms
    exports.config.GITHUB_SLEEP = 60.0 * 60.0 * 1000.0 / 60.0;

  }
}
