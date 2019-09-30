var dd = require('datejs');
var mongoose = require('mongoose');
var model = require('../mongo/models');

exports.index = function(req, res){
    /**
    * Build up and render the main screen
    * 1 - Most Viewed (Mais visitados)
    * 2 - Last registered events (Ultimos eventos cadastrados)
    * 3 - Schedule (Agenda)
    * 4 - Last Comments (Ultimos comentarios)
    * 5 - Last registered users (Ultimos usuarios cadastrados)
    * 6 - Twitter
    * 7 - Facebook
    **/
    async.series({
        categories : function(callback) {
            Category.find({ locale: 'pt-BR', inactivatedAt: null }, function(err, cats) {
                if (err) throw err;

                var categories = [];

                categories.push(
                    {
                        id: 'cat_null',
                        name: 'Todas',
                        active: true
                    }
                );

                cats.forEach(function(cat) {
                    categories.push(
                        {
                            id: 'cat_' + cat.id,
                            name: cat.description,
                            active: false
                        }
                    )
                });

                //result
                callback(err, categories);
            });
        },
        events : function(callback) {
            //get all events - by current day
            var day, month, year;

            var date = Date.today().toString('dd/MM/yyyy');

            day = parseInt(date.split('/')[0], 10);
            month = parseInt(date.split('/')[1], 10);
            year = parseInt(date.split('/')[2], 10);

            var query = null;
            //TODO get by region too
            if (req.session.cat && req.session.cat != 'cat_null') {
                //with a category
                query = { "dates.day": day, "dates.month": month, "dates.year": year, _category: req.session.cat };
            } else {
                //with all categories
                query = { dates: { $elemMatch: {day: day, month: month, year: year} } };
            }

            var listEvent = [];

            Event.find(query, function(err, events) {
                if (err) throw err;

                events.forEach(function(event) {
                    var catName = '';

                    allCats.forEach(function(cat) {
                        if (cat.id === event._category) {
                            catName = cat.description;
                        }
                    });

                    var hour = null;

                    event.dates.forEach(function(d) {
                        if (d.day == day && d.month == month && d.year == year)
                            hour = d.hour;
                    });

                    listEvent.push(
                        {
                            id: event._id,
                            name: event.name,
                            description: event.description,
                            hits: event.hits,
                            catName: catName,
                            hour: hour,
                            rating: event.rating
                        }
                    );
                });

                //result
                callback(err, listEvent);
            });
        }
    },
    function(err, result) {

        dates = [];
        counter = -3;

        //render the dates - Calender
        for (var i = 0; i < 7; i++) {
            var date = Date.today().addDays(counter + i);
            var active = false;

            //default date is the current date
            if (date.toString('dd/MM') == Date.today().toString('dd/MM'))
                active = true;

            var dayWeekEng = date.toString('dddd');
            var dayWeek = '';

            //TODO get labels from i18
            switch (dayWeekEng) {
                case 'Monday' : dayWeek = 'Seg'; break;
                case 'Tuesday' :  dayWeek = 'Ter'; break;
                case 'Wednesday' : dayWeek = 'Qua'; break;
                case 'Thursday' : dayWeek = 'Qui'; break;
                case 'Friday' : dayWeek = 'Sex'; break;
                case 'Saturday' : dayWeek = 'Sáb'; break;
                case 'Sunday' : dayWeek = 'Dom'; break;
            }

            dates.push(
                {
                    id: 'tab' + date.toString('dd_MM'),
                    dateFormat: date.toString('dd/MM'),
                    date: date.toString('dd/MM/yyyy'),
                    dayWeek: dayWeek,
                    active: active
                }
            );

        }

        //TODO
        //get the events by city schedule
        //req.session.selectedDate = date;

        if (!req.session.cat || req.session.cat == undefined)
            req.session.cat = 'cat_null';

        //render the main screen (index)
        res.render('index', { title: 'Principal', city: 'Salvador', dates: dates, cats: result.categories, cat: req.session.cat, events: result.events });
    });
};

/**
 * Get events by category and date.
 * @param req
 * @param res
 */
exports.agendaChangeEvents = function(req, res) {
    var date = req.query.date;
    var idCat = null;

    if (req.query.idCat) {
        idCat = parseInt(req.query.idCat.split('_')[1], 10);
    }

    var day = parseInt(date.split('/')[0], 10);
    var month = parseInt(date.split('/')[1], 10);
    var year = parseInt(date.split('/')[2], 10);

    var query = null;
    //TODO get by region too not just date and category 

    //if (req.session.cat && req.session.cat != 'cat_null') {
    if (idCat) {
        //with category
        query = { dates: { $elemMatch: {day: day, month: month, year: year} }, _category: idCat };
    } else {
        //with any categories
        query = { dates: { $elemMatch: {day: day, month: month, year: year} } };
    }

    Event.find(query, function(err, events) {
        if (err) throw err;

        var list = [];
        var renderCat = (idCat == null);

        //prepare each event before it'll be rendered into Agenda Frame
        events.forEach(function(event) {
            var catName = '';

            allCats.forEach(function(cat) {
                if (cat.id === event._category) {
                    catName = cat.description;
                }
            });

            var hour = null;

            event.dates.forEach(function(d) {
                if (d.day == day && d.month == month && d.year == year)
                    hour = d.hour;
            });

            list.push(
                {
                    id: event._id,
                    name: event.name,
                    description: event.description,
                    hits: event.hits,
                    renderCat: renderCat,
                    catName: catName,
                    hour: hour,
                    rating: event.rating
                }
            );

        });

        res.contentType('application/json');
        res.end(JSON.stringify(list));
    });
};