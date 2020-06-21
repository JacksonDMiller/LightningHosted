import React, { useState } from 'react'
var QRCode = require('qrcode.react');


// Import React FilePond
import { FilePond, registerPlugin } from 'react-filepond';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateSize);


function Uploader() {
    const [file, setFiles] = useState([])
    const [invoice, setInvoice] = useState(null)
    const [paid, setPaid] = useState('false')
    return (
        <div>
            {invoice ? <QRCode value={invoice} /> : null}
            <span>{paid === true ? 'Paid' : null} </span>
            <FilePond
                files={file}
                allowMultiple={false}
                server={{
                    process: {
                        url: "/api/upload",
                        onload: (res) => setInvoice(JSON.parse(res).paymentRequest)
                    },
                    revert: null,
                    restore: null,
                    load: null,
                    fetch: null,
                }
                }
                instantUpload={false}
                maxFileSize='5mb'
            />

        </div>
    )
}

export default Uploader; 