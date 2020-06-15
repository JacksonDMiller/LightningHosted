import React, { useState } from 'react'
import axios from 'axios';


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

// Our app
// class Uploader extends Component {

//     state = {
//         // Set initial files, type 'local' means this is a file
//         // that has already been uploaded to the server (see docs)
//         file: []
//     }

//     render() {
//         return (

//             <FilePond

//                 files={this.state.file}
//                 allowMultiple={false}
//                 server="/api/upload"
//                 instantUpload={false}
//                 maxFileSize='5mb'
//             >
//             </FilePond >

//         );
//     }
// }



function Uploader() {
    const [file, setFiles] = useState([])
    return (
        <FilePond
            files={file}
            allowMultiple={false}
            server="/api/upload"
            instantUpload={false}
            maxFileSize='5mb'
        />
    )
}

export default Uploader; 