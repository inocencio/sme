(function () {
})();

/**
 * Change the current main photo to selected one.
 * @param id
 */
function changePhoto(id) {
    if (id) {
        $('#img-main').attr('src', $('#img-' + id).attr('src'))
    }
}