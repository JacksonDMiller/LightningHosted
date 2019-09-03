const inputElement = document.querySelector('input[type="file"]');
const pondOne = FilePond.create(inputElement);
const pond = document.querySelector('.filepond--root');


FilePond.setOptions(
    {
        acceptedFileTypes: ['image/*'],
        labelTapToUndo: 'Tap to upload another file',
        labelFileProcessingComplete: 'Please pay the invoice to complete the upload',
        labelIdle: 'Drag & Drop your image or <span class="filepond--label-action">Browse</span> to get started',
        server: {
            url: './upload',
            process: {
                onload: (res) => {

                    res = JSON.parse(res);



                    showMessage('pay this fool', res.image)
                    console.log(res)

                    addCard('', res.fileName, 0)
                    // select the right value in the response here and return
                    return res;
                },
                fetch: null,
                revert: null,
            },
        }
    });

pondOne.on('addfile', (error, file) => {
    if (error) {
        console.log('Oh no');
        return;
    }
    console.log('File added', file.serverId);
});


function showMessage(message, image) {
    $('#message-image').html('<img id="message-image" src="' + image + '" />')
    $('#message').text(message)
    $('#message-container').slideToggle('fast');
}

$.get("./user/", function (data, status) {

    data.images.forEach(element => {
        addCard(element.title, element.fileName, element.views)

        allItems = document.getElementsByClassName("item");
        for (x = 0; x < allItems.length; x++) {
            imagesLoaded(allItems[x], resizeInstance);
        }
    });
});

function addCard(title, fileName, views) {
    $(".grid").append('<div id="photoCard' + x + '" class="item photo"> <div class="content"> <div class="title"> <h3>' + title + '</h3> </div> <img class="photothumb" src="/noauth/image/' + fileName + '"> <div class="desc"> <p>Views: ' + views + '</p> </div> </div> </div>')
}