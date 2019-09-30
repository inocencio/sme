var mongo = require('mongodb');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');
var configApp = require('../config/app_config');
var model = require('../mongo/models.js');

Grid.mongo = mongoose.mongo;

exports.saveFileToGridFS = function(user, removeFileFromDisk, fileName, mimeType, description) {
    var conn = model.newMongooseConnection();

    conn.once('open', function() {
       var options = {
           "contentType": mimeType,
           "filename" : fileName,
           "metadata":{
               "author": user.name,
               "uid" : user.uid,
               "provider" : user.provider,
               "description" : description
           },
           "chunk_size": 1024*4
       };

        var gfs = Grid(conn.db);
        var ws = gfs.createWriteStream(fileName, options);
        fs.createReadStream(configApp.temp_files + fileName).pipe(ws);
    });
};

exports.readFileFromGridFS = function(uid, provider, description, callback) {
    var conn = model.newMongooseConnection();
    var mongoose = model.mongooseInstance;

    conn.once('open', function() {

    });
};