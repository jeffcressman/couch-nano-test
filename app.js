var nano = require('nano')('http://localhost:5984');
var Q = require('q');
var credentials = require('./credentials.json');
var cookies = [];

function authenticate(username, password){
  var deferred = Q.defer();
  nano.auth(username, password, function (err, body, headers) {
    if (err) {
      deferred.reject(console.log(err));
    }

    if (headers && headers['set-cookie']) {
      cookies[credentials.username] = headers['set-cookie'];
      deferred.resolve(cookies[credentials.username]);
    }

    console.log("Authenticated as " + credentials.username);
  });

  return deferred.promise;
}

authenticate(credentials.username, credentials.password)
.then(function(){
  // var auth = /AuthSession=.*?;/.exec(cookies[credentials.username]);
  // console.log(auth);
  nano = require('nano')({
    url: 'http://localhost:5984',
    cookie: cookies[credentials.username]
  });
})
.then(function(){
  // clean up the database we created previously
  nano.db.destroy('alice', function() {
    // create a new database
    nano.db.create('alice', function(error, body) {
      if (!error) {
        console.log('database alice created!');
      } else {
        console.log(error);
      }

      // specify the database we are going to use
      var alice = nano.use('alice');
      // and insert a document in it
      alice.insert({ crazy: true }, 'rabbit', function(err, body, header) {
        if (err) {
          console.log('[alice.insert] ', err.message);
          return;
        }

        // change the cookie if couchdb tells us to
        if (header && header['set-cookie']) {
          cookies[credentials.username] = header['set-cookie'];
        }

        console.log('you have inserted the rabbit.');
        console.log(body);
      });
    });
  });
});
