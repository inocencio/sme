/*
    Ito-Uploader
    Autor: Inocencio T. de Oliveira
    Data: 4/02/2013
    Desc: This is a file uploader componente using HTML5 and Bootstrap layout.
*/

var files = null;
var filesError = null;
var process = {};
var amount = 262144; //256kb
var countCompleted = 0;
var token = $('#token').val();
var socket = io.connect('http://localhost:8000'); //better to put the address in an isolated file

if (window.File && window.FileList && window.FileReader) {
    //page is ready to work with HTML5 file uploader
    init();
} else {
    //render an invalid HTML5 file uploader support
}

function init() {
    var filesUpload = document.getElementById('files-upload');
    $('#btn-send').prop('disabled', true);

    filesUpload.addEventListener('change', fileHandler, false);
    filesUpload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
            var percentage = Math.round((e.loaded * 100) / e.total);
            console.log(percentage + '%');
            $('#percent').html(percentage + '%');
        }
    }, false);
}

function fileHandler(e) {
    filesError = [];
    filesTemp = [];
    var next = null;
    var validation = false;

    $.get('/event/ajaxCanOpenModalPhoto', { token: token }, function(data) {
        data = parseInt(data, 10);

        if (data < 3) {

            countCompleted = data;

            if (!files || files.length < 3) {
                files = e.target.files || e.dataTransfer.files;

                //list all files in the table
                var counter = 0 + countCompleted;
                next = function() {
                    while(counter < files.length) {
                        var file = files[counter];

                        //::1 - check file type
                        var format = file.type.split('/')[1];
                        if (format == 'png' || format == 'jpeg' || format == 'jpg') {
                            //::2 - check the picture' size
                            if (file.size <= 5242880) { //5mb
                                //::3 - check the picture' minimal dimention size
                                var img = new Image();
                                var reader = new FileReader();

                                reader.onload = function(e) {
                                    img.onload = function() {
                                        if (this.width >= 640 && this.height >= 480) {
                                            filesTemp.push(file);
                                            localStorage.setItem(file.name, 'true');
//                                            ++counter;next();
                                        } else {
                                            console.log('erro: dimensao');
                                            filesError.push(file.name + ' tem dimensão inferior a 640x480.');
                                        }
                                    };
                                    img.src = e.target.result;
                                };
                                reader.readAsDataURL(file);
                                ++counter;next();
                            } else {
                                console.log('erro: limite');
                                filesError.push(file.name + ' excedeu o limite de 5mb.');
                                ++counter;next();
                            }
                        } else {
                            console.log('erro: formato');
                            filesError.push(file.name + ' não é um formato válido de foto. Formatos: jpg, jpeg e png.');
                            ++counter;next();
                        }
                    }
                };
                next();

                setTimeout(function() {
                    console.log('Create!');
                    //recreate files list based on filesTemp if it is not empty
                    files = null;
                    if (filesTemp && filesTemp.length > 0)
                        files = filesTemp;

                    if (files) {
                        $('#btn-send').prop('disabled', false);
                        for (var i = 0; i < files.length; i++) {
                            renderFileOutput(files[i], i + countCompleted);
                        }
                    } else {
                        //disable "send button" when sending file
                        $('#btn-send').prop('disabled', true);
                    }

                    renderFilesError();
                }, 200);

            }
        } else {
            console.log('Nao renderiza tabela');
        }

    });

}

/**
 * If we got errors then returns true.
 * @param file
 * @return {Boolean}
 */
function checkForError(file) {

    if (file.size > 5242880) { //5mb
        return ' excedeu o limite de 5mb.';
    }

    checkDimension(file);
    setTimeout(function() {
        console.log(localStorage.getItem('width') + 'x' + localStorage.getItem('height'));
        if (localStorage.getItem('width') < 640 || localStorage.getItem('height') < 480) {
        }
    }, 100);

    return '';
}

function checkDimension(file) {
    var img = new Image();
    var reader = new FileReader();
    localStorage.setItem('width', null);
    localStorage.setItem('height', null);

    reader.onload = function(e) {
        img.onload = function() {
            localStorage.setItem('width', this.width);
            localStorage.setItem('height', this.height);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renderFilesError() {
    if (filesError && filesError.length > 0) {
        var out = '<h5>O(s) arquivo(s) abaixo não será(ão) enviado(s):</h5><ul>';

        filesError.forEach(function(file) {
            console.log(file);
            out += '<li>' + file + '</li>'
        });

        out += '</ul>';
        $('#files-table-error').html(out).show();
    } else {
        $('#files-table-error').html('').hide();
    }
}

function renderFileOutput(file, counter) {
    var reader = new FileReader();
    var out = "";

    reader.onload = function(e) {
        out =
            "<tr>" +
                "<td>" + "<img src='" + e.target.result + "' style='width: 48px; height: 48px;' />" + "</td>" +
                "<td>" + file.name + "</td>" +
                "<td>" + Math.round(file.size / 1024) + " kb</td>" +
                "<td>" + parsePictureFormat(file) + "</td>" +
                "<td><span id='file-id-" + counter  +"'>" + "0%" + "</span></td>" +
                "<td style='text-align: center'><a href='#' id='file-id-remove-" + counter  +"' class='icon-remove' onclick='javascript:removeFile(\"" + file.name + "\")'></a></td>" +
            "</tr>";

        $('#files-table > tbody:last').append(out);
    };
    reader.readAsDataURL(file);
}

function isValidPicture(file) {
    var format = parsePictureFormat(file).toLowerCase();
    return (format == 'png' || format == 'jpeg' || format == 'jpg');
}

function parsePictureFormat(file) {
    var format = file.type;
    return format.split('/')[1];
}

function removeAll() {
    files = null;
    filesError = null;
    countCompleted = 0;
    $('#files-table tr').not(function(){if ($(this).has('th').length){return true}}).remove();
    $('#files-table-error').html('').hide();
}

function removeFile(e) {
    var pos = null;
    var newFiles = [];

    var file =  findFileByName(e) || process[e].file;

    for (var x = 0; x < files.length; x++) {
        if (files[x].name != file.name)
            newFiles.push(files[x])
    }

    files = null;
    ++countCompleted;

    $('#files-table tr').not(function(){if ($(this).has('th').length){return true}}).remove();

    for (var i = 0; i < newFiles.length; i++) {
        renderFileOutput(newFiles[i], i + countCompleted);
    }

    files = newFiles;
}

function findFileByName(name) {
    for (var i = 0; i < files.length; i++) {
        if (files[i].name == name)
            return files[i];
    }

    return null;
}

function sendFiles() {
    var btn = $('#btn-send');

    btn.val('Enviando...');
    uploadFiles();
}

function uploadFiles() {
    if (files) {
        for (var i = 0; i < files.length; i++) {
            var reader = new FileReader();
            var file = files[i];
            var chunks = [];
            var fileProp = {
                name        : file.name,
                size        : file.size,
                type        : file.type,
                fileID      : i + countCompleted,
                buffer      : '',
                position    : 0,
                chunks      : 0,
                completed   : false
            };

            var quantity = Math.round((file.size / amount)) + (file.size % amount > 0 ? 1 : 0);

            for (var j = 0; j < quantity; j++) {

                var chunk = {
                    position        : 0,
                    start           : 0,
                    end             : 0
                };

                //position zero
                if (j == 0 && quantity > 1) {
                    chunk.end = amount;
                } else if (j == 0 && quantity == 1) {
                    chunk.end = file.size;
                }

                //greater than zero
                if (j > 0 && j < quantity - 1) {
                    chunk.position = j;
                    chunk.start = amount * j;
                    chunk.end = chunk.start + amount;
                }

                //reach the end
                if (j == quantity - 1) {
                    chunk.position = j;
                    chunk.start = amount * j;
                    chunk.end = chunk.start + (file.size - chunk.start);
                }

                chunks.push(chunk);
            }

            fileProp.chunks = chunks.length;

            process[fileProp.name] = {
                file        : file,
                fileProp    : fileProp,
                chunks      : chunks,
                reader      : reader
            };
            //send with file name and file data properties
            socket.emit('file-start', fileProp.name, fileProp, token);
        } // end-for
    }
}

socket.on('file-sendmore', function(name, percent) {
    //update the percentage status
    updatePercentage(name, percent);

    var newFile = null;
    var reader = process[name].reader;
    var selectedFile = process[name].file;
    var position = process[name].fileProp.position;

    var chunk = process[name].chunks[position];

//    console.log('Arquivo Atual: ' + selectedFile.name + " / Chunk: " + JSON.stringify(chunk));

    if (selectedFile.slice) {
        newFile = selectedFile.slice(chunk.start, chunk.end);
    } else if (selectedFile.webkitSlice) {
        newFile = selectedFile.webkitSlice(chunk.start, chunk.end);
    } else {
        newFile = selectedFile.mozSlice(chunk.start, chunk.end);
    }

    reader.onload = function(e) {
        var buffer = e.target.result;
        socket.emit('file-upload', name, buffer, position);
        process[name].fileProp.position = process[name].fileProp.position + 1;
    };
    reader.readAsBinaryString(newFile);
});

socket.on('file-done', function(name, percent) {
    var ele = '#file-id-' + process[name].fileProp.fileID;

    process[name].fileProp.completed = true;
    ++countCompleted;

    $(ele).html(percent + '%').css('color', '#008000').css('font-weight', 'bold')
        .attr('data-original-title', 'Foto enviada com sucesso').tooltip();
});

function updatePercentage(name, percent) {
    var fileID = process[name].fileProp.fileID;

    console.log('Percent>> ID: ' + fileID + ' : ' + Math.round(percent));
    var ele = '#file-id-' + fileID;
    $(ele).html(percent + '%');
}