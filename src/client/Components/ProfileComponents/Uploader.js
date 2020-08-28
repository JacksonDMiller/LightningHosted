import React, { useState } from "react";
var QRCode = require("qrcode.react");

// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

// Register the plugins
registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize
);

function Uploader({ addImage }) {
  const [file, setFile] = useState([]);
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const pond = React.createRef();
  const [isUploading, setIsUploading] = useState(false);
  const upload = () => {
    setIsUploading(true);
    pond.current.processFiles();
  };

  return (
    <div className='center filepond-container'>
      {file.length !== 0 ? (
        <div className="row">
          <div className="input-field col s10">
            <textarea maxLength="40"
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              id="icon_prefix5"
              className="materialize-textarea"
            ></textarea>
            <label htmlFor="icon_prefix5">Title</label>
          </div>
        </div>
      ) : null}
      <FilePond
        acceptedFileTypes={[
          "image/png",
          "image/jpeg",
          "image/gif",
          "video/mp4",
        ]}
        ref={pond}
        files={file}
        allowMultiple={false}
        labelIdle={`<span class="filepond--label-action hide-on-large-only">Tap to upload an image and stack sats</span>
          <span class="filepond--label-action hide-on-small-only hide-on-med-only">Click to upload an image and stack sats</span>`}
        onupdatefiles={(e) => {
          setFile(e);
          setIsUploading(false);
        }}
        server={{
          process: {
            ondata: (formData) => {
              formData.append("caption", caption);
              formData.append("title", title);
              return formData;
            },
            url: "/api/upload",
            onload: (res) => {
              res = JSON.parse(res);
              if (!res.errror) {
                addImage(res);
                setCaption("");
                setFile([]);
              }
            },
          },
          revert: null,
          restore: null,
          load: null,
          fetch: null,
        }}
        allowProcess={false}
        allowRevert={false}
        instantUpload={false}
        maxFileSize="5mb"
      />
      {file.length !== 0 ? (
        <div className="row">
          <div className="input-field col s10">
            <textarea
              maxLength="15000"
              onChange={(e) => {
                setCaption(e.target.value);
              }}
              id="icon_prefix4"
              className="materialize-textarea"
            ></textarea>
            <label htmlFor="icon_prefix4">Caption</label>
          </div>
          {isUploading ?
            <button className="btn">
              Uploading...
            </button>
            : (
              <button className="btn" onClick={upload}>
                <i className="material-icons prefix col s2">arrow_upward</i>{" "}
              Upload
              </button>
            )}
        </div>
      ) : null}
    </div>
  );
}

export default Uploader;
