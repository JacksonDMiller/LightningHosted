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
