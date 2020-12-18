import React, { useState } from "react";
import ReactGA from "react-ga";

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
import FilePondPluginImageTransform from "filepond-plugin-image-transform";

// Register the plugins
registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize,
  FilePondPluginImageTransform
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
    ReactGA.event({
      category: "User",
      action: "Image Uploaded",
    });
  };

  return (
    <div className="center filepond-container">
      {file.length !== 0 ? (
        <div className="row">
          <div className="input-field col s10">
            <textarea
              maxLength="60"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              id="icon_prefix5"
              className="materialize-textarea title-input"
            ></textarea>
            <label htmlFor="icon_prefix5">Title</label>
          </div>
        </div>
      ) : null}
      <FilePond
        acceptedFileTypes={["image/jpeg", "video/mp4"]}
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
                setTitle("");
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
        maxFileSize={"5mb"}
        imageTransformOutputQuality={50}
      />
      {file.length !== 0 ? (
        <div className="row">
          <div className="input-field col s10">
            <textarea
              maxLength="15000"
              onChange={(e) => {
                setCaption(e.target.value);
              }}
              value={caption}
              id="icon_prefix4"
              className="materialize-textarea"
            ></textarea>
            <label htmlFor="icon_prefix4">Caption</label>
          </div>
          {isUploading ? (
            <button className="btn">Uploading...</button>
          ) : (
            <button className="btn upload-btn" onClick={upload}>
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
