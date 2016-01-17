var nano = require('nano')('http://localhost:5984');
var credentials = require('./credentials.json');
var cookies = [];
var callback = console.log;

nano.auth(credentials.username, credentials.password, function (err, body, headers) {
  if (err) {
    return callback(err);
  }

  if (headers && headers['set-cookie']) {
    cookies[credentials.username] = headers['set-cookie'];
    console.log(cookies[credentials.username][0]);
  }

  callback(null, "Authenticated as " + credentials.username);
});

// TODO: We need promises here because the cookie hasn't returned yet.
//       Using the value eventually returned works just fine
var auth = /AuthSession=(.*?);/.exec(cookies[credentials.username]);
console.log(auth);
// var auth = cookies[credentials.username][0];
nano = require('nano')({
  url: 'http://localhost:5984',
  cookie: 'AuthSession=' + auth
});

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
