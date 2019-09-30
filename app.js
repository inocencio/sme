 /**
Copyright (c) 2019 tecWizard - Inocencio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

 Project: Social Media - Events
 Version: 1.0 - alpha
 Date: 05/09/2013
 Dev: Inocencio
 Design and prototype: Inocencio and Andre
 DB: Inocencio
 Operation and Tests: Inocencio
 **/

var
    express = require('express')
    , app = express()
    , http = require('http')
    , server = http.createServer()
    , routes = require('./routes')
    , _ = require('underscore')._
    , user = require('./routes/user')
    , photo = require('./routes/photo.js')
    , event = require('./routes/event.js')
    , resources = require('./routes/resources.js')
    , path = require('path')
    , formidable = require('formidable')
    , dd = require('datejs')
    , fs = require('fs')
    , mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , gm = require('gm')
    ;

GLOBAL.async = require('async');

GLOBAL.Photo = mongoose.model('Photo');
GLOBAL.Event = mongoose.model('Event');
GLOBAL.EventPhoto = mongoose.model('EventPhoto');
GLOBAL.Category = mongoose.model('Category');
GLOBAL.User = mongoose.model('User');
GLOBAL.Tag = mongoose.model('Tag');

var io = require('socket.io').listen(8000, {log: false});
var MemoryStory = express.session.MemoryStore;
var sessionStore = new MemoryStory();

////////////////////
// passport
////////////////////

var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;

var passSocket = require('passport.socketio');

passport.serializeUser(function(user, done) {
    done(null, user.provider + '_' + user.id);
});

passport.deserializeUser(function(id, done) {
    user.findByUID(id, function(err, user) {
        app.locals.session = { user: user };
        done(err, user);
    });
});

//ensure with user is authenticated
//NOTE: you can comment it to make it pass through without any auth requests. 
function ensureAuthenticated(req, res, next) {
   if (req.isAuthenticated()) { return next(); }
   res.redirect('/');
}

/////////////////////
// redes sociais
/////////////////////

// 1 - Facebook
passport.use(new FacebookStrategy(
    {
        clientID: '<<CLIENT_ID>>',
        clientSecret: '<<CLIENT_SECRET>>',
        callbackURL: '/auth/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            //is user registered in database?
            var uid = profile.provider + '_' + profile.id;
            user.findByUID(uid, function(err, oldUser) {
                if (oldUser) {
                    //user found, update it
                    user.update('facebook', profile);
                    return done(null, profile);
                } else {
                    //new user
                    user.save(profile);
                    return done(null, profile);
                }
            });
        });

    }
));

////////////////////////
// Socket.IO + Passport
////////////////////////
io.set('authorization', passSocket.authorize({
    key         : 'esp_key_ito',            //this cookie stores SID session
    secret      : 'app_sec_session',        //the key to create the parser for the cookie
    store       : sessionStore,
    fail        : function(data, accept) {
        console.log('Session-IO: ERROR!');
        accept(null, true);
    },
    success     : function(data, accept) {
        accept(null, true);
    }
}));


////////////////////////
// configuracao
////////////////////////

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser( { keepExtensions: true, uploadDir: path.join(__dirname, '/tmp/uploads/') } ));
    app.use(express.methodOverride());
    app.use(express.cookieParser('app_sec_cookie'));
    app.use(express.session( { secret: 'app_sec_session', cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}, key: 'esp_key_ito', store: sessionStore } ));
    //passport
    app.use(passport.initialize());
    app.use(passport.session());
    //routes
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

/////////////////
// routes
/////////////////

//filter
app.all('/*', function(req, res, next) {
    next();
});

//application routes
app.get('/', routes.index);
app.get('/agendaChangeEvents', routes.agendaChangeEvents);
app.get('/users', user.list);

app.get('/event/new', event.new);
app.post('/event/new', event.save);
app.get('/event/show/:id', event.showEvent);
app.get('/event/ajaxRenderPhotos', event.ajaxRenderPhotos);
app.get('/event/ajaxCanOpenModalPhoto', event.ajaxCanOpenModalPhoto);

app.get('/resources/gettag', resources.getTags);
app.post('/resources/updatetag', resources.updateTags);

app.get('/showProfilePhoto/:id', photo.showProfilePhoto);
app.get('/photo/showPhotoById/:id', photo.showPhotoById);
app.get('/photo/showProfilePhotoByIdAsBase64/:id', photo.showProfilePhotoByIdAsBase64);
app.get('/photo/showThumbnailPhotoById/:id', photo.showThumbnailPhotoById);
app.get('/photo/changeMainPhoto', photo.changeMainPhoto);
app.get('/photo/removePhoto', photo.removePhoto);
app.get('/auth/logout', function(req, res){
    req.logout();
    app.locals.session = { user: null };
    res.redirect('/');
});

//auth routes
app.get('/auth/facebook', passport.authenticate('facebook', {scope:
    [
        'read_stream', 'export_stream', 'publish_actions', 'email', 'create_event', 'create_note',
        'photo_upload', 'user_photos', 'user_relationship_details', 'user_hometown', 'user_birthday', 'user_photos',
        'user_about_me', 'user_location'
    ]
}));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { display: 'touch', successRedirect: '/', failureRedirect: '/login' }));

////////////////////
// helpers
////////////////////

app.locals.session = { user: null };

////////////////////
// bootstrap
////////////////////

require('./bootstrap.js');

////////////////////
// start
////////////////////
app.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function(socket) {
    //TODO check the socket.io settings with MongoStore. If you open two browsers teh handshake stop
    var files = {};

    socket.on('file-start', function(name, file, token) {
        console.log('Iniciando o upload...');

        //build a entry of the file
        files[name] = {
            name        : name,
            data        : '',
            size        : file.size,
            type        : file.type,
            fileID      : file.fileID,
            downloaded  : 0,
            position    : 0,
            chunks      : file.chunks,
            token       : token
        };

        var dirPath = __dirname + '/tmp/uploads/' + token;

        fs.exists(dirPath, function(exists) {

            if (!exists) {
                fs.mkdir(dirPath, 0777);
            }

            //create the file
            console.log('File created at: ' + '/tmp/uploads/' + token + '/' + name);
            fs.open(dirPath + '/' + name, 'a', 0755, function(err, fd) {
                if (err) {
                    console.log('Error File Writer: ' + err);
                    //TODO send an error msg to client
                } else {
                    files[name].handler = fd;
                    var percent = 0;
                    socket.emit('file-sendmore', name, percent);
                }
            });
        });

    });

    socket.on('file-upload', function(name, buffer, position) {
        var file = files[name];
        file.downloaded += buffer.length;
        file.data += buffer;
        file.position = position;

        var percent = Math.round((file.downloaded / file.size)) * 100;

        if (position <= file.chunks - 1) {
            console.log('Escrevendo chunk: [ ' + name + ' , pos:' + position + " , tamanho: " + buffer.length + ' ]');

            fs.write(file.handler, file.data, null, 'Binary', function(err, written, buffer) {
                if (file.position == file.chunks - 1) {
                    var originalPhoto = __dirname + '/tmp/uploads/' + file.token + '/' + name;
                    var user = app.locals.session.user;

                    //close the file
                    fs.close(file.handler, function() {
                        socket.emit('file-done', name, percent);

                        savePhotoToMongo(user, file, originalPhoto, 'thumbnail');
                        savePhotoToMongo(user, file, originalPhoto, 'gallery');
                    });

                } else {
                    //clean up the cache
                    files[name].data = '';
                    socket.emit('file-sendmore', name, percent);
                }
            });
        }
    });

});

/**
 * Save an original photo from disk to Thumbnail and Gallery format. All photos stored into upload directory will be
 * removed on servers starts again or a scheduled time. 
 * @oarans user
 * @param file
 * @param filePath
 * @param photoType
 */
function savePhotoToMongo(user, file, filePath, photoType) {

    var photoChanged = null;

    if (photoType == 'thumbnail') {
        photoChanged = __dirname + '/tmp/uploads/' + file.token + '/' +
            path.basename(filePath, path.extname(filePath)) + '_thumbnail' + path.extname(filePath);
    } else if (photoType == 'gallery') {
        photoChanged = __dirname + '/tmp/uploads/' + file.token + '/' +
            path.basename(filePath, path.extname(filePath)) + '_gallery' + path.extname(filePath);
    }

    gm(filePath)
        .size({ bufferedStream: true }, function(err, size) {

            if (photoType == 'thumbnail')
                this.resize(300, 200);
            else if (photoType == 'gallery') {
                if (size.width > 800 && size.height > 600) {
                    this.resize(800, 600);
                }
            }

            this.write(photoChanged, function(err) {
                if (err) throw err;
                //salva a foto no banco
                setTimeout(function() {
                    var data = fs.readFileSync(photoChanged);

                    //GM novamente para pegar o tamanho da foto modificada
                    gm(photoChanged).size({ bufferedStream: true }, function(err, size) {
                        new Photo(
                            {
                                _user: user,
                                name: file.name,
                                provider: user.definition.provider,
                                token: file.token,
                                data: data,
                                photoType: photoType,
                                width: size.width,
                                height: size.height,
                                description: '',
                                contentType: file.type,
                                length: data.length
                            }
                        )
                            .save(function(err, photo) {
                                //save it
                                setTimeout(function() {
                                    new EventPhoto({ token: file.token, _photo: photo._id, main: false }).save();
                                    //unleash the photos
                                    fs.unlink(photoChanged);
                                }, 250);
                            });
                    });

                }, 100);
            });
        });
};