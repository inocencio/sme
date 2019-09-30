var
    mongoose = require('mongoose'),
    model = require('../mongo/models'),
    User = mongoose.model('User'),
    Photo = mongoose.model('Photo'),
    Event = mongoose.model('Event'),
    EventPhoto = mongoose.model('EventPhoto'),
    Category = mongoose.model('Category'),
    hg = require('http-get'),
    fs = require('fs'),
    mimeType = require('../utils/mime.js'),
    Backbone = require('backbone'),
    async = require('async'),
    _ = require('underscore')._,
    sanitize = require('validator').sanitize,
    S = require('string')
;

exports.new = function(req, res) {
    //get all categories and set in a list
    var categories = [];

    Category.find({ locale: 'pt-BR', inactivatedAt: null }, function(err, docs) {
        if (!err) {
            var token = Math.random().toString(36).substring(10);
            req.session.token = token;
            categories = docs;

            //novo evento
            var event = new Event();
            req.session.categories = docs;
            res.render('event_new',
                {
                    title: 'Novo Evento',
                    categories: docs,
                    token: token,
                    menuActive: '#li-event',
                    name: '',
                    address: '',
                    description: '',
                    tags: '',
                    category: '',
                    optTicket: '',
                    rating: '',
                    ticketGender: [],
                    ticketValue: [],
                    dateDay: [],
                    dateHour: [],
                    errorMsgs : [],
                    edit: false
                }
            );
        }
    });
};

exports.save = function(req, res) {
    var token = req.session.token;
    var name = req.body.name;
    var address = req.body.address;
    var description = req.body.description;
    var tags = req.body.tags;
    var category = req.body.category;
    var rating = req.body.rating;
    //ticket
    var optTicket = req.body.optTicket;
    var ticketGender = req.body.ticketGender;
    var ticketValue = req.body.ticketValue;
    //dates
    var dateDay = req.body.dateDay;
    var dateHour = req.body.dateHour;

    async.series(
        {
            photo: function(callback) {
                EventPhoto.count({ token: token, main: true }, function(err, c) {
                    if (err)
                        callback(err, null);
                    callback(null, c);
                });
            }
        },
        function(err, results) {
            if (!err) {
                //////////////////
                // Validation
                //////////////////
                var errorMsgs = [];

                if (!name || (name.length < 5 || name.length > 60)) {
                    errorMsgs.push('O nome deve ser informado e possuir entre 5 e 60 caracteres.');
                }

                if (!address || (address.length < 10 || address.length > 120)) {
                    errorMsgs.push('O endereço deve ser informado e possuir entre 10 e 120 caracteres.');
                }

                if (!dateDay || !dateHour) {
                    errorMsgs.push('Forneça, ao menos, uma data e uma hora para o evento.');
                } else {
                    if (_.isArray(dateDay) && _.isArray(dateHour)) {
                        if (dateDay.length != dateHour.length) {
                            errorMsgs.push('A Data ou hora está faltando.');
                        }
                    }
                }

                if (!category || _.isEmpty(category)) {
                    errorMsgs.push('A categoria deve ser informada.');
                }

                if (!rating || _.isEmpty(rating)) {
                    errorMsgs.push('Classificação Indicativa de ser informada.');
                }

                if (results.photo == 0) {
                    errorMsgs.push('Forneça, ao menos, uma foto para o evento e a marque como destacada.');
                }

                console.log("optTicket: " + optTicket);
                console.log("ticketGender: " + ticketGender);
                console.log("ticketValue: " + ticketValue);

                if (optTicket == 'optTicket1' && (!ticketGender && !ticketValue)) {
                    errorMsgs.push('É necessário informar algum valor de ingresso.');
                } else if (optTicket == 'optTicket1') {
                    if (ticketGender && ticketValue && (ticketGender.length != ticketValue.length)) {
                        errorMsgs.push('É necessário informar todas as quantidades de ingresso corretamente.');
                    }
                }

                //preparing to store in database
                if (_.isEmpty(errorMsgs)) {
                    var formatDate = [];

                    if (!_.isArray(dateDay)) {
                        dateDay = [dateDay];
                    }

                    if (!_.isArray(dateHour)) {
                        dateHour = [dateHour];
                    }

                    if ( (dateDay.length > 0 && dateHour.length > 0) && (dateDay.length == dateHour.length) ) {
                        for(var i = 0; i < dateDay.length; i++) {
                            var hour = parseInt(dateHour[i].split(':')[0], 10);
                            var minute = parseInt(dateHour[i].split(':')[1], 10);

                            var date = Date.parseExact(dateDay[i], 'dd/MM/yyyy').add(
                                {
                                    hours : hour,
                                    minutes : minute
                                }
                            );
                            var day = parseInt(date.toString("dd"), 10);
                            var month = parseInt(date.toString("MM"), 10);
                            var year = parseInt(date.toString("yyyy"), 10);

                            formatDate.push(
                                {
                                    date    : date,
                                    day     : day,
                                    month   : month,
                                    year    : year,
                                    hour    : dateHour[i]
                                }
                            );
                        }
                    }

                    //save the event data
                    var event = new Event(
                        {
                            name            : name,
                            description     : description,
                            descriptionRaw  : S(description).stripTags(),
                            address         : address,
                            tags            : tags,
                            _category       : category,
                            dates           : formatDate,
                            rating          : rating,
                            country         : 'BRT'
                        }
                    )
                        .save(function(err, doc) {
                            if (err) throw err;

                            //look for all photos that have the same token and replacei it to the event's ID.
                            EventPhoto.update({ token: token }, { $set: { _event : doc._id } }, { multi: true }, function(err, docs) {});

                            res.redirect('/event/show/' + doc._id);
                        });
                } else {
                    //an error has occurred, render the screen again with filled data
                    res.render('event_new',
                        {
                            title: 'Novo Evento',
                            token: token,
                            menuActive: '#li-event',
                            name: name,
                            address: address,
                            description: description,
                            tags: tags,
                            rating: rating,
                            category: category,
                            categories: req.session.categories,
                            optTicket: optTicket,
                            ticketGender: ticketGender,
                            ticketValue: ticketValue,
                            dateDay: dateDay,
                            dateHour: dateHour,
                            errorMsgs : errorMsgs,
                            edit: true,
                            country: 'BRT'
                        }
                    );
                }
            } //got no errors
        }
    ); //series

};

/**
 * Render registered event photos by a token.
 * @param req
 * @param res
 */
exports.ajaxRenderPhotos = function(req, res) {
    var token = req.query.token;

    var p = '';
    var out = '';

    //table-bordered
    out +=
        '<table class="table">' +
            '<tbody>';

    Photo.find({ token: token, photoType: 'thumbnail' }, function(err, photos) {
        if (err) throw err;

        if (photos) {
            //render the photo
            p = '<tr style="width: 165px!important;">';
            photos.forEach(function(photo) {
                p += '<td class="center-text"><img src="/photo/showPhotoById/' + photo._id + '" class="img-polaroid" style="width:195px!important; height:150px!important;" /></td>';
            });
            p += '</tr>';

            //render the main button
            p += '<tr style="width: 165px!important;">';
            var i = -1;
            var next = function() {
                i++;
                if (i < photos.length) {
                    var photo = photos[i];
                    EventPhoto.findOne({ _photo: photo._id }, function(err, doc) {
                        if (doc && doc.main) {
                            p += '<td class="center-text"><div class="input-append"><a href="#" class="btn btn-success" title="A foto já está destacada">destacada</a><a href="#" class="btn" title="Clique para apagar a foto" onclick="javascript:removePhoto(\'' + photo._id + '\');"><i class="icon-remove"></i></a></div></td>';
                        } else {
                            p += '<td class="center-text"><div class="input-append"><a href="#" class="btn btn-warning" title="Clique para destacar a foto" onclick="javascript:changeMainPhoto(\'' + photo._id + '\');">destacar</a><a href="#" class="btn" title="Clique para apagar a foto" onclick="javascript:removePhoto(\'' + photo._id + '\');"><i class="icon-remove"></i></a></div></td>';
                        }
                        next();
                    });
                }
                else {
                    p += '</tr>';

                    //concatenate the table
                    out += p;
                    out += '</tbody></table>';

                    res.writeHead(200, {'content-type': 'text/plain'});
                    res.end(out);
                }
            };
            next();

        } else {
            //there are no photos to be rendered
            res.writeHead(200, {'content-type': 'text/plain'});
            res.end('');
        }
    });
};

/**
 * Check if it possible to open the photo's modal
 * @param req
 * @param res
 */
exports.ajaxCanOpenModalPhoto = function(req, res) {
    var token = req.query.token;

    Photo.count({ token: token }, function(err, c) {
        res.writeHead(200, {'content-type': 'text/plain'});
        if (!c) c = '0';
        res.end(c.toString());
    });
};

/**
 * Main show event page.
 * @param req
 * @param res
 */
exports.showEvent = function(req, res, next) {
    var id = req.params.id;
    var event, photos = null;

    if (id) {
        async.waterfall([
            function(callback) {
                Event.findOne({_id: id}, function(err, event) {
                    //callback event
                    Category.findOne({id: event._category}, function(err, cat) {
                        callback(null, event, cat);
                    });

                });
            },
            function(event, cat, callback) {
                EventPhoto.find({ _event: event._id }, function(err, docs) {
                    if (!err && docs) {

                        var photos = [];
                        var photosID = [];
                        docs.forEach(function(doc) {
                            photosID.push(doc._photo);
                        });

                        Photo.find({_id: { $in: photosID }, photoType: 'thumbnail'}, function(err, docs) {
                            if (!err && docs) {

                                docs.forEach(function(doc) {
                                    var photo = {
                                        id: doc._id,
                                        width: doc.width,
                                        height: doc.height,
                                        length: doc.length,
                                        contentType: doc.contentType,
                                        description: doc.description,
                                        data: doc.data.toString('base64')
                                    };

                                    photos.push(photo);
                                });

                                //callback photos
                                callback(null, {event : event, photos : photos, category: cat});
                            }
                        });

                    }
                });
            }
        ],
        function(err, result) {
            if (!err && result) {

                if (result.photos && result.photos !== 'undefined' && result.photos !== '[]')
                    photos = result.photos;

                event = result.event;
                photos = result.photos;

                //add a view to an event
                Event.update({ _id: event._id }, { $inc : { hits: 1 } }, function(err, doc) {});

                res.render('event_show', { title: 'Evento - ' + event.name, event: result.event, photos: photos, category: result.category});
            }
        });
    }
};