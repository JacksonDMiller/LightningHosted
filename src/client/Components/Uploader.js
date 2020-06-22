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
    const [paid, setPaid] = useState(false)

    const checkForPayment = (invoice) => {
        var counter = 0
        var cp = setInterval(async () => {
            counter = counter + 1
            if (counter === 300) {
                clearInterval(cp)
            }
            let res = await fetch('/api/checkpayment/' + invoice)
            console.log(res.status)
            if (res.status === 200) {
                setPaid(true)
                clearInterval(cp)
            }

        }, 1000);
    }


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
                        onload: (res) => {
                            res = JSON.parse(res)
                            setInvoice(res.paymentRequest);
                            checkForPayment(res.paymentRequest);
                        }
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