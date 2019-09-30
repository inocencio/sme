/**
 * Code execution routines.
 * Performs read and write routines on MongoDB GridFS into fs.files and fs.chuncks.
 * These routines are executed daily.
 * @type {Function}
 */

var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('gridfs-stream'),
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert'),
    fs = require('fs'),
    request = require('request'),
    configDB = require('../config/db.js'),
    configApp = require('../config/app_config'),
    path = require('path')
    ;

var mongo = require('mongodb');

//connecting to database
var db = new Db(configDB.name, new Server(configDB.host, configDB.port,
    {auto_reconnect: false, poolSize: 4}), {w:0, native_parser: false});

/**
 * Save the file where is currently stored in "/tmp/files".
 *
 * @param user - user's instance from database
 * @param removeFileFromDisk - if true, removes the file from directory "/tmp/files"
 * @param fileName - the file's name with extension - no absolute path
 * @param mimeType - file mimeType (check mime.js for more details)
 * @param callback(err) - callback function to return errors
 */
exports.saveFile = function(user, removeFileFromDisk, fileName, mimeType, desc, callback) {
    db.close();
    db.open(function(err, db) {
        var filePath = configApp.temp_files + fileName;

        //setting up the file
        var options = {
            "content_type": mimeType,
            "filename" : fileName,
            "metadata":{
                "author": user.name,
                "uid" : user.uid,
                "provider" : user.provider,
                "description" : desc
            },
            "chunk_size": 1024*4
        };

        try {

            deleteFile(user.uid, user.provider, 'profile');
            saveFileToMongo(db, fileName, options);

            if (removeFileFromDisk) {
                fs.unlink(path.resolve(filePath), function(err) {
                });
            }

            callback(null);
        }   catch(err) {
            callback(err);
        }   finally {
            db.close();
        }

    });
};

/**
 * Save the file data into GridFS.
 * @param db
 * @param fileName
 * @param options
 */
function saveFileToMongo(db, fileName, options) {
    var fileID = new ObjectID();

    var gridStore = new GridStore(db, fileID, fileName, 'w', options);
    var filePath = configApp.temp_files + fileName;

    // Read the filesize of file on disk (provide your own)
    var fileSize = fs.statSync(filePath).size;
    // Read the buffered data for comparision reasons
    var data = fs.readFileSync(filePath);
    // Open a file handle for reading the file
    var fd = fs.openSync(filePath, 'r', 0666);

    // Open the new file
    gridStore.open(function(err, gridStore) {

        // Write the file to gridFS using the file handle
        gridStore.writeFile(fd, function(err, doc) {

            if (err) {
                throw err;
            }

            // Read back all the written content and verify the correctness
            GridStore.read(db, fileID, function(err, fileData) {

                console.log();
                // Comparing two files hashs
                assert.equal(data.toString('base64'), fileData.toString('base64'));
                assert.equal(fileSize, fileData.length);
            });
        });
    });
}


/**
 * Read the file data from fs.files returning each chunk.
 * @param uid
 * @param callback(err, contentType, content)
 */
exports.readFile = function(uid, provider, description, callback) {
    db.close();
    db.open(function(err, db) {
        var col = db.collection('fs.files');

        //looking for the file by UID and description
        col.findOne({"metadata.uid" : uid, "metadata.provider" : provider, "metadata.description" : description}, function(err, data) {
            //com o arquivo encontrado le o conteudo do chunks passando o ID do arquivo
            GridStore.read(db, data._id, function(err, content) {
                callback(err, data.contentType, content);
                db.close();
            });
        });
    });
};

/**
 * Remove a file by UID and description.
 * @param uid
 * @param description
 * @param callback
 */
var deleteFile = function(uid, provider, description) {
    var col = db.collection('fs.files');

    col.find({"metadata.uid" : uid, "metadata.provider" : provider, "metadata.description" : description}).toArray(function(err, docs) {
        docs.forEach(function(doc) {
            new GridStore(db, doc._id, 'r').open(function(err, gridStore) {
                gridStore.unlink(function(err, result) {
                    //check if file already exists
                    GridStore.exist(db, doc._id, function(err, result) {
                        //return callback( (!!(result === false)) );
                    });
                });
            });
        });
    });
};