(function () {
})();

/**
 * Load categories by a specific date.
 * @param date
 * @param idData
 */
function agendaChangeEvents(date, idData, idCat) {
    //HTML element ID object that will be rendered
    var id = null;

    if (idCat !== 'undefined')
        id = '#' + idData + '_' + idCat;
    else
        id = '#' + idData + '_cat_null';

    var pathURL = '/agendaChangeEvents?date=' + date;

    //if cateogory ID exists
    if (idCat && !(idCat == undefined || idCat === 'undefined' || idCat == 'cat_null')) {
        pathURL += '&idCat=' + idCat;
    }

    $.getJSON(pathURL,
        {
            beforeSend : function() {
                //render "loading..." image
                var img = '<img src="/images/loadingdots.gif"/> ';
                $(id).html(img);
            }
        }
        ,
        function(result) {
            if (result && JSON.stringify(result) != '[]') {

                var o = '<ul class="thumbnails">';

                result.forEach(function(e) {
                    o += '<li class="span3"><div class="thumbnail, agenda-frame"><a href="/event/show/' + e.id + '"><img class="agenda-img" src="/photo/showThumbnailPhotoById/'
                        + e.id + ' " alt=""></a>';
                    if (e.renderCat)
                        o += '<h5 class="agenda-event-para">' + e.catName + '</h5>';
                    o += '<p class="agenda-event-para"><a href="/event/show/' + e.id + '">' + e.name + '</a></p>';
                    o += '<table class="table agenda-event-table"><tr>' +
                        '<td class="agenda-event-time"><img class="icon-time"><span>&nbsp <strong>' + e.hour + '</strong></span></td>' +
                        '<td class="agenda-event-time"><strong>' + e.hits + ' views</strong></span></td>' +
                        '<td class="agenda-event-time"><strong>' + e.rating + '</strong></span></td>' +
                        '</tr></table>';
                    o += '</div></li>';
                });
                o += '</ul>';

                $(id).html(o);
            } else {
                $(id).html('Não há eventos para o dia e categoria selecionados.');
            }
            //forces a reload
            //window.location.reload();
        }
    );
}