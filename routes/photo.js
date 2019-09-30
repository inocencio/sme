var
    mongoose = require('mongoose'),
    model = require('../mongo/models'),
    Photo = mongoose.model('Photo'),
    EventPhoto = mongoose.model('EventPhoto'),
    User = mongoose.model('User'),
    hg = require('http-get'),
    fs = require('fs'),
    configApp = require('../config/app_config'),
    mimeType = require('../utils/mime.js'),
    mongogrid = require('../mongo/mongogrid.js'),
    Schema = mongoose.Schema,
    path = require('path'),
    gm = require('gm')
    ;

/**
 * Show the profile's photo. This photo is stored on User's collection instead of Photo's collection. Profile Photos
 * are small and it can be sized about 1k-5k.
 * @param req
 * @param res
 */
exports.showProfilePhoto = function(req, res) {
    User.findOne({ _uid: req.params.id }, function(err, doc) {
        if (err) {
            throw err;
        } else {
            res.contentType(doc.photoProfile.contentType);
            res.end(doc.photoProfile.data, 'binary');
        }
    });
};

/**
 * Get a photo data from Photo Collection by user ID.
 * @param req
 * @param res
 */
exports.showPhotoById = function(req, res) {
    if (req.params.id) {
        Photo.findOne({ _id: req.params.id }, function(err, doc) {
            if (err) throw err;
            if (doc) {
                res.contentType(doc.contentType);
                res.end(doc.data, 'binary');
            }
        });
    }
};

/**
 * Get the profile photo as base64 string format that can be rendered as a picture.
 * @param req
 * @param res
 */
exports.showProfilePhotoByIdAsBase64 = function(req, res) {
    console.log("base64 " + req.params.id);
    if (req.params.id) {
        User.findOne({ _uid: req.params.id }, function(err, doc) {
            if (err) throw err;
            if (doc) {
                res.contentType('text/plain');
                res.end('data:' + doc.photoProfile.contentType + ';base64,' + doc.photoProfile.data.toString('base64'));
            }
        });
    }
};

/**
 * Get the main photo from the event as thumbnail format.
 * @param req
 * @param res
 */
exports.showThumbnailPhotoById = function(req, res) {
    if (req.params.id) {
        EventPhoto.findOne({ main: true, _event: req.params.id }, function(err, ePhoto) {
            Photo.findById(ePhoto._photo, function(err, photo) {
                if (photo) {
                    res.contentType(photo.contentType);
                    res.end(photo.data, 'binary');
                }
            });
        });
    }
};

/**
 * Get all remaining photos except the main one.
 * @param req
 * @param res
 */
exports.findAllNoMainThumbnailByEventId = function(req, res) {
    if (req.params.id) {
        EventPhoto.find({ main: false, _event: req.params.id }, function(err, docs) {
            if (!err && docs) {

                var photos = [];

                docs.forEach(function(doc) {
                    var photo = {
                        id: doc._id,
                        width: doc.width,
                        height: doc.height,
                        length: doc.lenght,
                        description: doc.description
                    };

                    photos.push(photo);
                });
            }
        });
    }
};

/**
 * Turn a photo into a main one.
 * NOTE: Only a thumbnail photo can be turned on.
 * @param req
 * @param res
 */
exports.changeMainPhoto = function(req, res) {
    var id = req.query.id;

    Photo.findOne({ _id: id, photoType: 'thumbnail'}, function(err, photo) {
        if (err) throw err;

        if (photo) {
            var token = photo.token;
            EventPhoto.update({ token: token }, { $set: { main: false } }, { multi: true }, function(err, docs) {
                EventPhoto.update({ _photo: photo._id }, { $set: { main: true } }, function(err, ephoto) {
                    res.writeHead(200, { 'content-type': 'text/plain'});
                    res.end('');
                });
            });
        }
    });

};

/**
 * Remove a photo by ID.
 * @param req
 * @param res
 */
exports.removePhoto = function(req, res) {
    var id = req.query.id;

    Photo.findById(id, function(err, photo) {
        if (err) throw err;

        if (photo) {
            photo.remove();

            EventPhoto.findOne({ _photo: id }, function(err, ephoto) {
                if (err) throw err;

                if (ephoto) ephoto.remove();

                res.writeHead(200, { 'content-type': 'text/plain'});
                res.end('');
            });
        }
    });
};