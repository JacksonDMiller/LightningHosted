const inputElement = document.querySelector('input[type="file"]');
const pond = FilePond.create( inputElement );

FilePond.setOptions(
    {
        acceptedFileTypes: ['image/*'],
        labelTapToUndo:'Tap to upload another file',
        labelFileProcessingComplete:'Please pay the invoice to complete the upload',
        labelIdle:'Drag & Drop your image or <span class="filepond--label-action">Browse</span> to get started',
        server: {
            process: './upload',
            fetch: null,
            revert: null,
        },
    }
);


function showMessage(message, image){
    $('#message-image').html('<img id="message-image" src="'+image+'" />')
    $('#message').text(message)
    $('#message-container').slideToggle('fast');
}

$.get("./user/", function (data, status) {
    // var data = JSON.parse(data);
    
    data.images.forEach(element => {
       $(".grid").append('<div id="photoCard' + x + '" class="item photo"> <div class="content"> <div class="title"> <h3>' + element.title + '</h3> </div> <img class="photothumb" src="/noauth/image/' + element.fileName + '"> <div class="desc"> <p>Views: ' + element.views + '</p> </div> </div> </div>')
 
       allItems = document.getElementsByClassName("item");
       for (x = 0; x < allItems.length; x++) {
          imagesLoaded(allItems[x], resizeInstance);
       }
    });
});