const inputElement = document.querySelector('input[type="file"]');
const pondOne = FilePond.create(inputElement);
const pond = document.querySelector('.filepond--root');


FilePond.setOptions(
    {
        acceptedFileTypes: ['image/*'],
        labelTapToUndo: 'Upload another file',
        labelFileProcessingComplete: '',
        labelIdle: 'Drag & Drop your image or <span class="filepond--label-action">Browse</span> to get started',
        server: {
            url: './upload',
            process: {
                onload: (res) => {

                    res = JSON.parse(res);
                    showMessage('Please pay the invoice to complete the upload', res.image)
                    checkPaymentStatus(res.invoice)
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


function showMessage(message, image, link) {
    if (image != undefined) {
        $('#message-image').html('<img id="message-image" src="' + image + '" />')
    }
    else{
        $('#message-image').html('')
    }
    if (link != undefined) {
        $('#message-link').text(link)
    }
    else{
        $('#message-link').html('')
    }

    $('#message').text(message)
    setTimeout(function () {
        $('#message-container').slideToggle('slow')
    }, 1000);



}

$.get("./user/", function (data, status) {
    console.log(data);

    data.images.forEach(element => {
        if (element.deleted === false && element.payStatus === true) {
            addCard(element.title, element.fileName, element.views, element._id, element.upVotes)
        }

    });
});

function addCard(title, fileName, views, id, upvotes) {
    if (title != '') {
        $(".grid").append(
            `<div id="photoCard` + x + `" class="item photo">
     <div class="content"> 
     <div class="title"> <h3>` + title + `</h3> </div> 
     <img class="photothumb" src="/noauth/image/` + fileName + `"> 
     <div class="desc"> 
     <p>Views: ` + views + `</p>
     <p>Upvotes: ` + upvotes + `</p>
     <button class="btn" onclick="deleteImage('`+ id + `')">Delete</button>
     </div> </div> </div>`)
    }
    else {
        $(".grid").prepend(
            `<div id="photoCard` + x + `" class="item photo">
     <div class="content"> 
     <div id="title`+ id + `" class="centered titleInput title">
                <div class="group"> 
                  <input type="text" id="`+ id + `" required="required" autocomplete="off">
                  <label for="name">Title</label>
                  <div class="bar"></div>
                </div>
              </div> 
     <img class="photothumb" src="/noauth/image/` + fileName + `"> 
     <div class="desc">
    <p>Views: ` + views + `</p>
     <p>Upvotes: ` + upvotes + `</p>
     <button class="btn" onclick="deleteImage('`+ id + `')">Delete</button>
    </div> </div> </div>`
        )
        allItems = document.getElementsByClassName("item");
        for (x = 0; x < allItems.length; x++) {
            imagesLoaded(allItems[x], resizeInstance);
        }

        $('#' + id).keyup(function (event) {
            if (event.which == 13) {
                $.get("./title/" + $(':focus').attr('id') + "/" + $(':focus').val() + '/', function (data, status) {
                    console.log('#title' + id)
                    $('#title' + id).html(`<div class="title"> <h3>` + $(':focus').val() + `</h3> </div>`).removeClass('centered').removeClass('titleInput')
                });
            }
        });
    }
}

function checkPaymentStatus(invoice, incrment) {
    if (incrment === undefined) {
        incrment = 1
    }
    $.get("./paymentStatus/" + invoice, function (data, status) {
        if (data.payStatus === false) {
            if (incrment === 300) {
                return
            }
            incrment++
            setTimeout(() => {
                checkPaymentStatus(invoice, incrment)
            }, 1000)
        }
        else {
            $('#message-container').slideToggle('fast')
            addCard('', data.fileName, 0, data._id, 0)
            // this link will not work in production
            showMessage('Thank you please use this link to share your photo and earn some sats!', undefined, window.location.hostname+':3000/noauth/share/'+data.fileName)
        }
    })
};

function deleteImage(id) {
    $.get("./delete/" + id, function (data, status) {
        console.log(data)
    });
}