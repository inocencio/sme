var
    mongoose = require('mongoose'),
    model = require('../mongo/models'),
    User = mongoose.model('User'),
    hg = require('http-get'),
    fs = require('fs'),
    configApp = require('../config/app_config'),
    mimeType = require('../utils/mime.js'),
    photo = require('./photo.js')
;

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.findByUID = function(id, callback) {
    User.findOne({ _uid: id }, function(err, user) {
        callback(err, user);
    })
};

exports.save = function(profile) {
    console.log("Salvando usuario...");
    var user = new User();

    user._uid = profile.provider + '_'+ profile.id;
    user.definition.id = profile.id;
    user.definition.provider = profile.provider;
    user.name = profile.displayName;
    user.firstName = profile._json.first_name;
    user.lastName = profile._json.last_name;
    user.login = profile._json.username;
    user.timezone = profile._json.timezone;
    user.locale = profile._json.locale;
    user.gender = profile._json.gender;
    user.email = profile._json.email;
    user.link = profile._json.link;
    user.photoURL = 'http://graph.facebook.com/' + user.definition.id + '/picture';
    user.birth = profile._json.birthday;
    user.hits = 1;
    user.logonAt = Date.now();

    var userProfilePhoto = user._uid + '.png';
    var pPhoto = configApp.temp_files + userProfilePhoto;

    console.log("Photo URL: " + user.photoURL);
    console.log("Photo: " + userProfilePhoto);

    var saveImage = false;

    hg.get(user.photoURL, pPhoto, function(err, result) {
        if (result) {
            console.log('Salvando imagem...');
            user.photoProfile.length = fs.statSync(pPhoto).size;
            user.photoProfile.data = fs.readFileSync(pPhoto);
            user.photoProfile.contentType = mimeType.mime_png;
            user.photoProfile.updatedAt = Date.now();
        }
        user.save();
    });

};

exports.update = function(provider, profile) {
    //TODO User.findOneAndUpdate()
    //API: http://mongoosejs.com/docs/api.html
    User.findOne({ _uid: profile.provider + '_' + profile.id }, function(err, user) {
        user.name = profile.displayName;
        user.firstName = profile._json.first_name;
        user.lastName = profile._json.last_name;
        user.login = profile._json.username;
        user.timezone = profile._json.timezone;
        user.locale = profile._json.locale;
        user.email = profile._json.email;
        user.link = profile._json.link;
        user.photoURL = 'http://graph.facebook.com/' + user.definition.id + '/picture';
        user.birth = profile._json.birthday;
        user.hits = user.hits + 1;
        user.logonAt = Date.now();

        var userProfilePhoto = user.provider + '_' + user.uid + '.png';

        hg.get(user.photoURL, configApp.temp_files + userProfilePhoto, function(err, result) {

            if (err) {
                console.log('Erro pegar foto: ' + err);
            } else {
                var pPhoto = configApp.temp_files + userProfilePhoto;

                user.photoProfile.length = fs.statSync(pPhoto).size;
                user.photoProfile.data = fs.readFileSync(pPhoto);
                user.photoProfile.contentType = mimeType.mime_png;
                user.photoProfile.updatedAt = Date.now();
            }

            user.save();
        });

    });
};