var edit = $('#edit').val() == 'true';
var dateDay = null;
var dateHour = null;
var $arrayDay = $('#array-dateDay');
var $arrayHour = $('#array-dateHour');
var ticketGender = null;
var ticketValue = null;
var $arrayGender = $('#array-ticketGender');
var $arrayValue = $('#array-ticketValue');

if ($arrayDay && $arrayDay.length > 0)
    dateDay = $arrayDay.val().split(',');

if ($arrayHour && $arrayHour.length > 0)
    dateHour = $arrayHour.val().split(',');

if ($arrayGender && $arrayGender.length > 0)
    ticketGender = $arrayGender.val().split(',');

if ($arrayValue && $arrayValue.length > 0)
    ticketValue = $arrayValue.val().split(',');

(function () {
    //load the text editor
    $("textarea").jqte();

    //select2
    if (edit == true) {
        $('#category').select2().select2('val', $('#field-category').val());
        $('#rating').select2().select2('val', $('#field-rating').val());
    } else {
        $('#category').select2();
        $('#rating').select2();
    }

    //clean up the editor
    //NOTA: Somente usado quando for um novo evento, nao para edicao
//    var list = $(':text');
//
//    for (var i = 0; i < list.length; i++) {
//        var text = $(list[i]);
//    }

    //tags
    $("#tags").select2({
        tags: true,
        tokenSeparators: [","],
        createSearchChoice: function(term, data) {
            if ($(data).filter(function() {
                return this.text.localeCompare(term) === 0;
            }).length === 0) {
                return {
                    id: term,
                    text: term
                };
            }
        },
        multiple: true,
        maximumSelectionSize: 5,
        ajax: {
            url: '/resources/gettag',
            dataType: "json",
            data: function(term, page) {
                return {
                    q: term
                };
            },
            results: function(data, page) {
                return {
                    results: data
                };
            }
        }
    });

    //photo
    if (edit == true) {
        //load the photos
        closeModalPhoto();
    }

    //////////////////////////////
    // Tickets and Dates
    //////////////////////////////

    var DateModel = function(day, hour) {
        var self = this;
        self.day = ko.observable(day);
        self.hour = ko.observable(hour);
    };

    var TicketModel = function(gender, value) {
        this.gender = gender;
        this.value = value;
    };

    function DateViewModel() {
        var self = this;

        self.dates = ko.observableArray([
            new DateModel("", "")
        ]);

        //mode: edit
        if (edit == true) {
            if (dateDay.length > 0)
                self.dates.remove( self.dates()[self.dates().length - 1] );

            for (var i = 0; i < dateDay.length; i++) {
                var sDate = dateDay[i];
                var sHour = dateHour[i];

                if ( (sDate && sDate !== 'undefined') && (sHour && sHour !== 'undefined') )
                    self.dates.push(new DateModel(sDate, sHour));
            }
        }

        self.addDate = function() {
            var pos = self.dates().length;
            pos = pos-1;

            if (self.dates()[pos].day() != '' && self.dates()[pos].hour() != '') {
                date = Date.parseExact(self.dates()[pos].day(), 'd/M/yyyy');

                if (date) {
                    date = date.addDays(1);
                    var sDate = date.toString('dd/MM/yyyy');

                    self.dates.push(new DateModel(sDate, ""));
                } else {
                    self.dates.push(new DateModel("", ""));
                }

                $('#list-dates').find('.input-small:last').mask('99/99/9999');
                $('#list-dates').find('.input-mini:last').mask('99:99').focus();

            }
        };

        self.removeDate = function(e) {
            self.dates.remove(e);
        };

        ///////////////////////////////
        // ticket
        ///////////////////////////////

        self.availableGenders = [
            'Todos',
            'Homem',
            'Mulher',
            'Criança'
        ];

        self.tickets = ko.observableArray([
            new TicketModel("", "")
        ]);

        if (edit == true) {
            if (ticketGender.length > 0)
                self.tickets.remove( self.tickets()[self.tickets().length - 1] );

            for (var i = 0; i < ticketGender.length; i++) {
                var sGender = ticketGender[i];
                var sValue = ticketValue[i];

                if ( (sGender && sGender !== 'undefined') && (sValue && sValue !== 'undefined') ) {
                    self.tickets.push(new TicketModel(sGender, sValue));
                }
            }
        }

        self.calcRemainingGenders = function() {
            var array = [];

            self.availableGenders.forEach(function(gender) {
                var found = false;

                for (var i = 0; i < self.tickets().length; i++) {
                    var ticket = self.tickets()[i];
                    if (ticket.gender == gender) found = true;
                }

                if (!found) array.push(gender);
            });

            return array;
        };

        self.canAddMoreTickets = function() {
            var counter = 0;

            self.availableGenders.forEach(function(gender) {
                for (var i = 0; i < self.tickets().length; i++) {
                    var ticket = self.tickets()[i];
                    if (ticket.gender == gender) ++counter;
                }
            });

            return (counter < 4)
        };

        self.genders = ko.observableArray(self.calcRemainingGenders());

        self.addTicket = function() {
            var pos = self.tickets().length;
            pos = pos-1;

            if (self.canAddMoreTickets()) {
                self.tickets.push(new TicketModel(self.calcRemainingGenders()[0], ""));
                $('#list-tickets').find('.input-mini:last').focus();
            }

        };

        self.removeTicket = function(e) {
            self.tickets.remove(e);
        };

    }

    //custom bindings for the event
    ko.bindingHandlers.dateMask = {
        init: function(element, valueAccessor, allBindsAccessor, viewModel, bindingContext) {
            $ele = $(element);
        },
        update: function(element, valueAccessor, allBindsAccessor, viewModel, bindingContext) {
            $ele = $(element);
            var options = ko.utils.unwrapObservable(valueAccessor());
            var format = options.format;
        }
    };

    ko.applyBindings(new DateViewModel());

    $('#list-dates .input-small:first').mask('99/99/9999');
    $('#list-dates .input-mini:first').mask('99:99');

    //focus on name
    $('#name').focus();

    //hide the error list
    $('#files-table-error').hide();

    //hide the texts in fields
    $('#span-el-address').hide();
    $('#span-el-description').hide();

    $('#optTicket1').attr('checked', true);
})();

//with ticket update radio box checked, pop up the tickets
function statusRadioTicket(e) {
    if (e.id == 'optTicket1') {
        $('#list-tickets').show('0.3');
    } else {
        $('#list-tickets').hide('0.3');
    }
}

function validateTime(e) {
    var ele = $(e);
    var errorMatch = false;
    var msg = '';

    var hour = parseInt(e.value.split(':')[0], 10);
    var min = parseInt(e.value.split(':')[1], 10);

    if (hour > 23 || hour < 0) {
        errorMatch = true;
        msg = 'Hora inválida. Limite entre 0 a 23.';
    } else if (min > 59 || min < 0) {
        errorMatch = true;
        msg = 'Minutos inválidos. Limite entre 0 a 59.';
    }

    if (errorMatch) {
        console.log(msg);
        ele.parent().addClass('control-group').addClass('error');
        ele.parent().find('.help-inline').html(msg);
        ele.focus();
    } else {
        ele.parent().removeClass('control-group').removeClass('error');
        ele.parent().find('.help-inline').html('');
    }
}

function validateDate(e) {
    var ele = $(e);
    var errorMatch = false;
    var msg = '';

    var day = parseInt(e.value.split('/')[0], 10);
    var month = parseInt(e.value.split('/')[1], 10);
    var year = parseInt(e.value.split('/')[2], 10);
    var curYear = new Date().getFullYear();

    if (day < 1 || day > 31) {
        errorMatch = true;
        msg = 'Dia inválido. Limite entre 1 e 31.';
    } else if (month < 1 || month > 12) {
        errorMatch = true;
        msg = 'Mês inválido. Limite entre 1 e 12.';
    } else if (year < curYear || year > curYear + 1) {
        errorMatch = true;
        msg = 'Ano inválido. Não pode ser inferior a ' + curYear + ' ou superior a ' + (curYear + 1) + '.';
    } else {
        date = Date.parseExact(e.value, 'd/M/yyyy');

        if (!date) {
            errorMatch = true;
            msg = 'Data informada é inexistente.'
        } else {
            var resultDate = Date.today().clearTime().compareTo(date);

            if (resultDate == 0 || resultDate == 1) {
                errorMatch = true;
                msg = 'Data informada é antiga ou do dia atual. Data mínima deve ser ' + Date.now().addDays(1).toString('d/MM/yyyy');
            }
        }
    }

    if (errorMatch) {
        console.log(msg);
        ele.parent().addClass('control-group').addClass('error');
        ele.parent().find('.help-inline').html(msg);
        ele.focus();
    } else {
        ele.parent().removeClass('control-group').removeClass('error');
        ele.parent().find('.help-inline').html('');
    }
}

function openModalPhoto() {
    $.get('/event/ajaxCanOpenModalPhoto', {token: token}, function(data) {
        data = parseInt(data, 10);
        if (data < 3) {
            countCompleted = data;
            $("#modal-photo").modal({keyboard: false,backdrop: "static"});
        } else {
            $('#btn-photo').attr('data-original-title', 'Limite de fotos não podem ultrapassar 3.').tooltip();
        }
    });
}

//when photo's modal closes, demands the screen to render it
function closeModalPhoto() {
    $.get('/event/ajaxRenderPhotos', {token: token}, function(data) {
        if (data && data.length > 0)
            $('#render-photos').html(data);

        $.get('/event/ajaxCanOpenModalPhoto', {token: token}, function(data) {
            if (data == 'false')
                $('#btn-photo').attr('data-original-title', 'Limite de fotos não podem ultrapassar 3.').tooltip();
        });
    });
}

//change the main photo
function changeMainPhoto(id) {
    $.ajax({
        type        : 'GET',
        url         : '/photo/changeMainPhoto?id=' + id,
        beforeSend  : function() {

        },
        complete    : function() {
            //renderiza novamente as fotos
            closeModalPhoto();
        }
    });
}

//remove a photo
function removePhoto(id) {
    $.ajax({
        type        : 'GET',
        url         : '/photo/removePhoto?id=' + id,
        beforeSend  : function() {

        },
        complete    : function() {
            //render photos back again
            closeModalPhoto();
            $('#btn-photo').removeAttr('data-original-title');
        }
    });
}

function sendOnceSubmit(e) {
    $ele = $(e);
    $ele.prop('disabled', true);
}