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
                    showMessage('Please pay the invoice to complete the upload', res.image)
                    addCard('', res.fileName, 0, res.id)
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
});


function showMessage(message, image) {
    $('#message-image').html('<img id="message-image" src="' + image + '" />')
    $('#message').text(message)
    setTimeout(function () {
        $('#message-container').slideToggle('slow')
    }, 1000);
   
    
    
}

$.get("./user/", function (data, status) {
    console.log(data);

    data.images.forEach(element => {
        addCard(element.title, element.fileName, element.views, element._id)

        allItems = document.getElementsByClassName("item");
        for (x = 0; x < allItems.length; x++) {
            imagesLoaded(allItems[x], resizeInstance);
        }
    });
});

function addCard(title, fileName, views, id) {
    if (title != '') {
        $(".grid").append(
            `<div id="photoCard` + x + `" class="item photo">
     <div class="content"> 
     <div class="title"> <h3>` + title + `</h3> </div> 
     <img class="photothumb" src="/noauth/image/` + fileName + `"> 
     <div class="desc"> <p>Views: ` + views + `</p> </div> </div> </div>`)
    }
    else {
        $(".grid").append(
            `<div id="photoCard` + x + `" class="item photo">
     <div class="content"> 
     <div id="title`+id+`" class="centered titleInput title">
                <div class="group"> 
                  <input type="text" id="`+id+`" required="required" autocomplete="off">
                  <label for="name">Title</label>
                  <div class="bar"></div>
                </div>
              </div> 
     <img class="photothumb" src="/noauth/image/` + fileName + `"> 
     <div class="desc"> <p>Views: ` + views + `</p> </div> </div> </div>`
        )
        $('#'+id).keyup(function (event) {
            if (event.which == 13) {
                $.get("./title/"+$(':focus').attr('id')+"/"+$(':focus').val()+'/', function (data, status) {
                    console.log('#title'+id)
                 $('#title'+id).html(`<div class="title"> <h3>` + $(':focus').val() + `</h3> </div>`).removeClass('centered').removeClass('titleInput')
                });
            }
        });
    }
}
