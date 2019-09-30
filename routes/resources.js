var
    mongoose = require('mongoose'),
    Tag = mongoose.model('Tag'),
    model = require('../mongo/models'),
    hg = require('http-get'),
    fs = require('fs'),
    mimeType = require('../utils/mime.js'),
    util = require('util')
    ;

exports.getTags = function(req, res) {
    if (req.query.q.length > 0) {
        var token = new RegExp(req.query.q, 'i');

        Tag.find({ description: token , inactivatedAt: null }, function(err, tags) {
            var tempArray = [];

            if (tags) {
                tags.forEach(function(tag) {
                    tempArray.push(
                        {
                            id: tag.description,
                            term: tag.description,
                            text: tag.description
                        }
                    );
                });
            }

            res.writeHead(200, {'content-type': 'text/json'});
            res.end(JSON.stringify(tempArray));
        });
    } else {
        res.writeHead(200, {'content-type': 'text/json'});
        res.end(JSON.stringify([]));
    }

};

exports.updateTags = function(req, res, next) {

    if (req.body.tags) {
        req.body.tags.forEach(function(tag) {
            Tag.findOne({ description: tag.toLowerCase(), inactivatedAt: null }, function(err, doc) {
                if (!err && !doc) {
                    //insert a new tag
                    new Tag({ description: tag.toLowerCase() }).save();
                }
            });
        });
    }

    next();
};