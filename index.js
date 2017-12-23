'use strict';

var MongoClient = require('mongodb').MongoClient

MongoClient.connect(
    'mongodb://127.0.0.1:27017/accounting',
    function (err, connection) {
        var collection = connection.collection('customers');

        //collection.ensureIndex('v', function(err, indexName){
        //connection.close();    
        //});
        
        //calls doUpate

        //results in only matching documents being printed
        //can find using regex 'n': /^#1/ matches docs whos n value starts with 1
        var doFind = function (callback) {
            //find method takes option param
            //limit, skip, sort

            //can also be applied to update and remove
            //$inc: {'v': +1} to increment
            //$mul to multiply
            //upsert creates new doc if no existing are matched

            //invoke callback function for each doc in result set
            //collection.find().each(function (err,document){

            //});

            //use mongodb streaming API
            var stream = collection.find(
                {},
                {'sort': '_id'}
            ).stream();

            stream.on('data', function(document){
                console.dir(document);
            });

            stream.on('end', function() {
                callback();
            });
            
            /* collection.find(
                {},
                {'sort': '_id'}
                //'v': 6,
                //'valuable': true
            ).each(function (err, document) {
                if(document === null){
                    callback();
                }else{
                    console.dir(document)
                }
            }); */

            
            //prints all documents to screen
            // collection.find().toArray(function (err, documents) {
            //     console.dir(documents);
            //     callback();
            // });
        };

        //doInsert recursively inserts 20 documents into the collection,
        //each documents has an n attribute with the serial number of its
        //insert operation of v value, which is random number between 0 and 9
        //doFind is called when 20 inserts reached
        var doInsert = function (i) {
            if (i < 20) {
                var value = Math.floor(Math.random() * 10);
                collection.insert({
                        'n': '#' + i,
                        'v': value
                    },
                    function (err, count) {
                        doInsert(i + 1);
                    });

            } else {
                console.log();
                console.log('Inserted', i, 'documents:');
                doFind(function () {
                    doUpdate();
                });
            }
        };

        //whether a document is updated or not depends on its v value,
        //$gt filters documents to those whose value is greater than 5
        //doFind called again once update is finished, printing the updates
        //then delete all documents using filter than matches any document

        //lte = less or equal
        //gte = greater or equal
        //ne = not equal
        //or = or
        var doUpdate = function () {
            collection.update(
                {'n': /^#1/},
                {'$mul': {'v': 2} },
                {'multi': true},
                   /*  'v': {
                        '$gt': 5
                    }
                }, {
                    '$set': {
                        'valuable': true
                    }
                }, {
                    'multi': true
                }, */
                function (err, count) {
                    console.log();
                    console.log('Updated', count, 'documents:');
                    doFind(function () {
                        collection.remove({}, function () {
                            connection.close();
                        });
                    });
                });
        };

        doInsert(0);
    });

//collection.insert({'name': 'Jane Doe'}, function(err, count){
//pass an empty object, apply update to all documents in the collection,
//set the age attribute of the documents to 24, adds attributes(age) that do not already exist
/*  collection.update(
     {},
     {'$set': {'age':24}},
     {'multi': true},
     function(err, count){
         console.log('Updated', count, 'documents')
 
         collection.find().toArray(function(err, documents){
             console.dir(documents);
             connection.close();
         });
     }); */
//});