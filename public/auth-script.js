FilePond.registerPlugin(FilePondPluginImageExifOrientation);
FilePond.registerPlugin(FilePondPluginFileValidateType);
FilePond.registerPlugin(FilePondPluginFileValidateSize);


const inputElement = document.querySelector('input[type="file"]');
const pondOne = FilePond.create(inputElement);
const pond = document.querySelector('.filepond--root');


pondOne.setOptions(
    {
        maxFileSize: '5MB',
        acceptedFileTypes: ['image/*'],
        labelTapToUndo: 'Upload another file',
        labelFileProcessingComplete: '',
        labelIdle: 'Drag & Drop your image or <span class="filepond--label-action">Browse</span> to get started',
        server: {
            url: './upload',
            process: {
                onload: (res) => {

                    res = JSON.parse(res);
                    showPayment(res.image, res.invoice)
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


function clearMessage() {
    $('#message-container').slideToggle('fast')
    setTimeout(function () {
        $('#message-image').html('')
        $('#message').text('');
        $('#message-invoice').text("")
    }, 500);
}

function showPayment(image, invoice) {
    $('#message-image').html('<img id="message-image" src="' + image + '" />')
    $('#message').text('Please pay the invoice to complete the upload');
    $('#message-invoice').attr("href", "lightning:" + invoice)

    setTimeout(function () {
        $('#message-container').slideToggle('slow')
    }, 500);
}

function showThankYou(link) {
    $('#message').text('Thank you please use this link to share your photo and earn some sats!');
    $('#message-link').text(link)
    setTimeout(function () {
        $('#message-container').slideToggle('slow')
    }, 100);

}

$.get("./user/", function (data, status) {
    console.log(data);
    $("#satsEarned").text(data.earnedSats)

    data.images.forEach(element => {
        if (element.deleted === false && element.payStatus === true) {
            addCard(element.title, element.fileName, element.views, element._id, element.upVotes, element.sats)
        }

    });
});

function addCard(title, fileName, views, id, upvotes, sats) {
    if (title != '') {
        $(".grid").append(
            `<div id="photoCard` + x + `" class="item photo">
     <div class="content"> 
     <div class="title"> <h3>` + title + `</h3> </div> 
     <a href="/noauth/share/`+ fileName + `">
     <img class="photothumb" src="/noauth/image/` + fileName + `"> 
     </a>
     <div class="desc"> 
     <p>Views: ` + views + `</p>
     <p>Upvotes: ` + upvotes + `</p>
     <p>Sats Earned: ` + sats + `</p>
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
              <a href="/noauth/share/`+ fileName + `">
              <img class="photothumb" src="/noauth/image/` + fileName + `"> 
              </a>
     <div class="desc">
    <p>Views: ` + views + `</p>
     <p>Upvotes: ` + upvotes + `</p>
     <p>Sats Earned: ` + sats + `</p>
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
            clearMessage();
            addCard('', data.fileName, 0, data._id, 0, 0)
            setTimeout(() => {
                showThankYou(window.location.hostname + ':3000/noauth/share/' + data.fileName)
            }, 1000)
            // this link will not work in production

        }
    })
};

function deleteImage(id) {
    $.get("./delete/" + id, function (data, status) {
        console.log(data)
    });
}


function withdraw() {
    if($('#satsEarned').text() === '0'){
        $.sweetModal({
            content: 'You have no sats to withdraw',
            title: 'Oh noes…',
            icon: $.sweetModal.ICON_ERROR,

            buttons: [
                {
                    label: 'That\'s fine',
                    classes: 'redB'
                }
            ]
        });
    }
    
       else{

    $.sweetModal.prompt('Enter a lighting invoice to withdraw', 'Lightning Invoice', '', function (val) {
        
        $.get("./withdraw/" + val, function (data, status) {
            
            if (data.status === 'success') {
                $.sweetModal({
                    content: 'This is a success.',
                    icon: $.sweetModal.ICON_SUCCESS
                });
                console.log(data.amount,'dataamount')
                console.log($('#satsEarned').text(parseInt($('#satsEarned').text())))
                $('#satsEarned').text(parseInt($('#satsEarned').text())-data.amount)
            }
            else {
                $.sweetModal({
                    content: data,
                    title: 'Oh noes…',
                    icon: $.sweetModal.ICON_ERROR,

                    buttons: [
                        {
                            label: 'That\'s fine',
                            classes: 'redB'
                        }
                    ]
                });
            }
        });



    });
}
}