var db = require('../config/db.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//schema: User
var User = new Schema(
    {
        _uid            : { type: String, index: true },
        definition      : {
            id          : String,
            provider    : String
        },
        photoProfile    : {
            data            : Buffer,
            contentType     : String,
            length          : Number,
            updatedAt       : { type: Date, default: Date.now() }
        },
        name            : String,
        firstName       : String,
        lastName        : String,
        login           : String,
        gender          : String,
        createdAt       : { type: Date, default: Date.now() },
        logonAt         : Date,
        birth           : String,
        country         : String,
        state           : String,
        city            : String,
        photoURL        : String,
        link            : String,
        hits            : Number,
        locale          : String,
        email           : String,
        timezone        : Number,
        photos          : { type: Schema.Types.ObjectId, ref: 'Photo' }
    }
);

//schema: Photo
var Photo = new Schema(
    {
        _user           : { type: Schema.Types.ObjectId, ref: 'User', index: true },
        provider        : String,
        token           : String,
        photoType       : String,
        _thumbnail      : { type: Schema.Types.ObjectId, ref: 'Photo' },
        width           : Number,
        height          : Number,
        name            : String,
        description     : String,
        data            : Buffer,
        contentType     : String,
        length          : Number,
        updatedAt       : { type: Date, default: Date.now() }
    }
);

//schema: Event
var Event = new Schema(
    {
        name            : String,
        description     : String,
        descriptionRaw  : String,
        createdAt       : { type: Date, default: Date.now() },
        updatedAt       : Date,
        inactivatedAt   : Date,
        _category       : Number,
        tags            : [String],
        site            : String,
        free            : Boolean,
        privateEvent    : Boolean,
        address         : String,
        addressTicket   : String,
        linkMap         : String,
        phones          : [
            {
                number  : String
            }
        ],
        tickets         : [{
            gender      : String,
            value       : Number
        }],
        dates           : [{
            date        : Date,
            day         : Number,
            month       : Number,
            year        : Number,
            hour        : String
        }],
        rating          : String,
        hits            : { type: Number, default: 0 },
        country         : String,
        state           : String,
        city            : String,
        comments        : [
            {
                _uid        : { type: Schema.Types.ObjectId, ref: 'Person' },
                createdAt   : { type: Date, default: Date.now() },
                description : String,
                rating      : String
            }
        ]
    }
);

//schema: EventPhoto
var EventPhoto = new Schema(
    {
        _event          : { type: Schema.Types.ObjectId, ref: 'Event', index: true },
        _photo          : { type: Schema.Types.ObjectId, ref: 'Photo', index: true },
        token           : { type: String, index: true },
        main            : Boolean
    }
);

//schema: Category
var Category = new Schema(
    {
        id                  : Number,
        description         : String,
        locale              : String,
        createdAt           : { type: Date, default: Date.now() },
        inactivatedAt       : Date
    }
);

//schema: Tag
var Tag = new Schema(
    {
        description         : { type: String, lowercase: true, trim: true },
        createdAt           : { type: Date, default: Date.now() },
        locale              : String,
        inactivatedAt       : Date
    }
);

//connecting to mongo
mongoose.connect('mongodb://' + db.user + ':' + db.pass + '@' + db.host + '/' + db.name);

//defining the models
mongoose.model('User', User);
mongoose.model('Photo', Photo);
mongoose.model('Event', Event);
mongoose.model('EventPhoto', EventPhoto);
mongoose.model('Category', Category);
mongoose.model('Tag', Tag);

exports.mongooseInstance = mongoose;

exports.newMongooseConnection = function() {
    return mongoose.createConnection('mongodb://' + db.user + ':' + db.pass + '@' + db.host + '/' + db.name);
};