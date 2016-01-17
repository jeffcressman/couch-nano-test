var nano = require('nano')('http://localhost:5984');
var db = nano.db.use('test_db');

// Nano doesn't provide an update function
db.update = function(obj, key, callback){
 var db = this;
 db.get(key, function (error, existing){
    if(!error) obj._rev = existing._rev;
    db.insert(obj, key, callback);
 });
};

// var data = {
//     name: 'pikachu',
//     skills: ['thunder bolt', 'iron tail', 'quick attack', 'mega punch'],
//     type: 'electric'
// };
//
// db.insert(data, 'unique_id', function(err, body){
//   if(!err){
//     console.log('Insert succeeded');
//   } else {
//     console.log('Insert failed with ' + err);
//   }
// });

var name = 'pikachu';
db.view('pokemon', 'by_name', {'key': name, 'include_docs': true}, function(select_err, select_body){
  if(!select_err){
    var doc_id = select_body.rows[0].id;
    var doc = select_body.rows[0].doc;

    //do your updates here
    doc.age = 99; //you can add new fields or update existing ones

    db.update(doc, doc_id, function(err, res){
      if(!err){
        //document has been updated
        console.log(res);
      }
    });
  }
});

var type = 'water';
db.view('pokemon', 'by_type', {'key': type, 'include_docs': true}, function(err, body){
  if(!err){
    var rows = body.rows; //the rows returned
    console.log(rows);
  }
});

// db.destroy(doc_id, revision_id, function(err, body) {
//   if(!err){
//     //done deleting
//     console.log(body);
//   }
// });
