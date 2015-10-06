function init(app) {
  console.log("gitstatus init");

  var GitHubApi = require("github");

/*
  var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    host: app.conf.github.host,              //"api.github.com", //"github.my-GHE-enabled-company.com", // should be api.github.com for GitHub
    pathPrefix:  app.conf.github.pathPrefix, //"/api/v3", // for some GHEs; none for GitHub
    timeout: 5000,
    headers: {
        "user-agent": app.conf.github.user-agent //"biodocker.gitstatus" // GitHub is happy with a unique user agent
    }
  });
*/
  
  var github = new GitHubApi(app.config.github);

  if ( app.config.github_authentication ) {
    console.log('authenticating', app.config.github_authentication);
    github.authenticate(app.config.github_authentication);

  } else {
    console.log('no authentication');

  }

  app.ext.GitHubApi = GitHubApi;
  app.ext.github    = github;
}


function update(app, username, repo, branch, clbk) {
  //http://mikedeboer.github.io/node-github/#authorization.prototype.get

  var repo_msg = {
    'user': username,
    'repo': repo,
    'sha' : branch
    //'number': 99,
    //'page': 1,
    //'per_page': 1
  };

  app.ext.github.repos.getCommits(repo_msg, 
    function(repo_err, repo_data) {
      //console.log('got commit. err:', repo_err, 'data', repo_data);
      console.log('got commit. err:', repo_err);

      if ( repo_err ) {
        console.error('FAILED GETTING REPO', username, repo, branch);
        process.exit(1);
      }

      get_trees_serial(app, username, repo, repo_data, 0, clbk);
    }
  );
}



function get_trees_serial(app, username, repo, list, curr, clbk) {
  var len = list.length;

  if ( curr == len ) {
    clbk()

  } else {
    var commit = list[curr];
    var sha    = commit.sha;
    //console.log("c",curr,"commit",commit);
    console.log("c",curr,"sha",sha);

    var tree_msg = {
      'user'     : username,
      'repo'     : repo,
      'sha'      : sha,
      'recursive': true
    };

    app.ext.github.gitdata.getTree(tree_msg,
      function(tree_err, tree_data) {
        console.log('tree. err:', tree_err, 'data:', tree_data);

        setTimeout(function() {
          get_trees_serial(app, username, repo, list, curr+1, clbk)
        }, app.config.GITHUB_SLEEP);
      }
    );
  }
}

exports.init   = init;
exports.update = update;





/*
http://mikedeboer.github.io/node-github/#repos
getCommit
getBlob
getTree
compareCommits
get
getAll
getCommit
getCommits
getContent
*/





/*
  list commits
  URL="https://api.github.com/repos/BioDocker/containers/commits"; curl -H "Time-Zone: GMT" -H "Accept: application/vnd.github.v3+json" $URL
[
  {
    "sha": "277851cb8bde8dd5c9bfe8d9aacc1aa8efefee4b",
    "commit": {
      "author": {
        "name": "Saulo",
        "email": "sauloal@gmail.com",
        "date": "2015-10-05T12:59:44Z"
      },
      "committer": {
        "name": "Saulo",
        "email": "sauloal@gmail.com",
        "date": "2015-10-05T12:59:44Z"
      },
      "message": "Merge pull request #15 from sauloaldocker/master\n\nbug in blast",
      "tree": {
        "sha": "c471191b72a53e696b53f311278a4dccde8574a4",
        "url": "https://api.github.com/repos/BioDocker/containers/git/trees/c471191b72a53e696b53f311278a4dccde8574a4"
      },
      "url": "https://api.github.com/repos/BioDocker/containers/git/commits/277851cb8bde8dd5c9bfe8d9aacc1aa8efefee4b",
      "comment_count": 0
    },
    "url": "https://api.github.com/repos/BioDocker/containers/commits/277851cb8bde8dd5c9bfe8d9aacc1aa8efefee4b",
    "html_url": "https://github.com/BioDocker/containers/commit/277851cb8bde8dd5c9bfe8d9aacc1aa8efefee4b",
    "comments_url": "https://api.github.com/repos/BioDocker/containers/commits/277851cb8bde8dd5c9bfe8d9aacc1aa8efefee4b/comments",
    "author": {
      "login": "sauloal",
      "id": 506579,
      "avatar_url": "https://avatars.githubusercontent.com/u/506579?v=3",
      "gravatar_id": "",
      "url": "https://api.github.com/users/sauloal",
      "html_url": "https://github.com/sauloal",
      "followers_url": "https://api.github.com/users/sauloal/followers",
      "following_url": "https://api.github.com/users/sauloal/following{/other_user}",
      "gists_url": "https://api.github.com/users/sauloal/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/sauloal/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/sauloal/subscriptions",
      "organizations_url": "https://api.github.com/users/sauloal/orgs",
      "repos_url": "https://api.github.com/users/sauloal/repos",
      "events_url": "https://api.github.com/users/sauloal/events{/privacy}",
      "received_events_url": "https://api.github.com/users/sauloal/received_events",
      "type": "User",
      "site_admin": false
    },
    "committer": {
      "login": "sauloal",
      "id": 506579,
      "avatar_url": "https://avatars.githubusercontent.com/u/506579?v=3",
      "gravatar_id": "",
      "url": "https://api.github.com/users/sauloal",
      "html_url": "https://github.com/sauloal",
      "followers_url": "https://api.github.com/users/sauloal/followers",
      "following_url": "https://api.github.com/users/sauloal/following{/other_user}",
      "gists_url": "https://api.github.com/users/sauloal/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/sauloal/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/sauloal/subscriptions",
      "organizations_url": "https://api.github.com/users/sauloal/orgs",
      "repos_url": "https://api.github.com/users/sauloal/repos",
      "events_url": "https://api.github.com/users/sauloal/events{/privacy}",
      "received_events_url": "https://api.github.com/users/sauloal/received_events",
      "type": "User",
      "site_admin": false
    },
    "parents": [
      {
        "sha": "89da674ad057ea7cfc5efe629b8d4ef805dfa9d1",
        "url": "https://api.github.com/repos/BioDocker/containers/commits/89da674ad057ea7cfc5efe629b8d4ef805dfa9d1",
        "html_url": "https://github.com/BioDocker/containers/commit/89da674ad057ea7cfc5efe629b8d4ef805dfa9d1"
      },
      {
        "sha": "111a73386b4308f1ffe0721d2cefe792ff887eb1",
        "url": "https://api.github.com/repos/BioDocker/containers/commits/111a73386b4308f1ffe0721d2cefe792ff887eb1",
        "html_url": "https://github.com/BioDocker/containers/commit/111a73386b4308f1ffe0721d2cefe792ff887eb1"
      }
    ]
  }
]





  list files modified in commit
  URL="https://api.github.com/repos/BioDocker/containers/git/trees/c471191b72a53e696b53f311278a4dccde8574a4?recursive=1"; \
  curl -H "Time-Zone: GMT" -H "Accept: application/vnd.github.v3+json" $URL
{
  "sha": "c471191b72a53e696b53f311278a4dccde8574a4",
  "url": "https://api.github.com/repos/BioDocker/containers/git/trees/c471191b72a53e696b53f311278a4dccde8574a4",
  "tree": [
    {
      "path": "BLAST",
      "mode": "040000",
      "type": "tree",
      "sha": "78961a1583c3c28c34cd89c5a90af8838b43264a",
      "url": "https://api.github.com/repos/BioDocker/containers/git/trees/78961a1583c3c28c34cd89c5a90af8838b43264a"
    },
    {
      "path": "BLAST/2.2.28-2",
      "mode": "040000",
      "type": "tree",
      "sha": "c8c1df963942c0ed902844a5bb2a74231a0149b8",
      "url": "https://api.github.com/repos/BioDocker/containers/git/trees/c8c1df963942c0ed902844a5bb2a74231a0149b8"
    },
    {
      "path": "denovoGUI/1.5.2/Dockerfile",
      "mode": "100644",
      "type": "blob",
      "sha": "b0dc23b091ee4713e9c1cba70527da8860b08199",
      "size": 1579,
      "url": "https://api.github.com/repos/BioDocker/containers/git/blobs/b0dc23b091ee4713e9c1cba70527da8860b08199"
    }
  ],
  "truncated": false
}






  get file content
  curl -H "Time-Zone: GMT" -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/BioDocker/containers/contents/"

*/
