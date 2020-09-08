import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import Uploader from "./ProfileComponents/Uploader";
import ImageCard from "./ImageCardComponents/ImageCard";
import AvatarUploader from "./ProfileComponents/AvatarUploader";
import ChangePasswordModal from "./ProfileComponents/ChangePasswordModal";
import WithdrawModal from "./ProfileComponents/WithdrawModal";
import ChangeUsernameModal from "./ProfileComponents/ChangeUsernameModal";
import Masonry from "react-masonry-css";
import ReactGA from "react-ga";

export default function Profile() {
  const [images, setImages] = useState([]);
  const [loggedIn, setLoggedIn] = useState(true);
  const [user, setUser] = useState({});
  const [imageToDelete, setImageToDelete] = useState("");

  useEffect(() => {
    ReactGA.pageview(`/profile`);
    const elems = document.querySelectorAll(".modal");
    const modelInstances = M.Modal.init(elems);
    var dropdownElems = document.querySelectorAll(".dropdown-trigger");
    var dropdownInstances = M.Dropdown.init(dropdownElems);
    const fetchData = async () => {
      const res = await fetch("/api/profileinfo/");
      if (res.status === 401) {
        setLoggedIn(false);
        return <Redirect to="/"></Redirect>;
      } else {
        const data = await res.json();
        const sortedImages = data.images.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setImages(sortedImages);
        setUser(data);
      }
    };
    fetchData();
  }, []);

  const openDeleteImage = async (imageId) => {
    setImageToDelete(imageId);
  };

  const deleteImage = async () => {
    let data = {
      imageId: imageToDelete,
    };

    const res = await fetch("/api/deleteimage/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.status === 200) {
      const newImages = images.filter((image) => {
        if (image.imageId !== imageToDelete) {
          return image;
        }
      });
      setImages(newImages);
      setImageToDelete("");
    }
  };

  const addImage = (image) => {
    const newImages = [image, ...images];
    setImages(newImages);
  };

  const updateAvatar = (data) => {
    setUser({ ...user, avatarUrl: data.avatarUrl });
  };

  return (
    <div className="row">
      {!loggedIn ? <Redirect to="/" /> : null}
      <div className="row profile-info">
        <div className="col s12 m2 avatar-img-div right-align">
          {user.avatarUrl ? (
            <img
              className="circle responsive-img avatar-image"
              src={user.avatarUrl}
            ></img>
          ) : null}
          <a
            className="dropdown-trigger profile-edit-btn"
            href="#"
            data-target="edit-dropdown"
          >
            <i className="material-icons black-text">edit</i>
          </a>
        </div>

        <h5 className="col s12 m10 center-align hide-on-med-and-up">
          {user.username}
        </h5>

        <h5 className="col s12 m10 left-align hide-on-small-only">
          {user.username}
        </h5>

        <p className="col s4 m10 hide-on-small-only">Views: {user.views} </p>
        <p className="col s4 m10 hide-on-small-only">
          Upvotes: {user.upvotes}{" "}
        </p>
        <p className="col s4 m2 hide-on-small-only">Sats: {user.sats} </p>

        <p className="col s4 m10 center-align hide-on-med-and-up">
          Views: {user.views}{" "}
        </p>
        <p className="col s4 m10 center-align hide-on-med-and-up">
          Upvotes: {user.upvotes}{" "}
        </p>
        <p className="col s4 m2 center-align hide-on-med-and-up">
          Sats: {user.sats}{" "}
        </p>

        <a
          className=" withdraw-button col s12 m2 waves-effect waves-light btn modal-trigger"
          href="#withdrawModal"
        >
          Withdraw
        </a>
      </div>

      <div className="">
        <Uploader addImage={addImage} />
      </div>
      <Masonry
        breakpointCols={{
          default: 4,
          1100: 3,
          700: 2,
          505: 1,
        }}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images
          ? images.map((image) => {
              return (
                <div key={image.imageId}>
                  <ImageCard
                    profile={true}
                    deleteImage={openDeleteImage}
                    imageData={image}
                  />
                </div>
              );
            })
          : null}
      </Masonry>

      <div id="editModal" className="modal">
        <div className="modal-content row">
          <h4 className="center-align">Choose a new avatar</h4>
          <AvatarUploader updateAvatar={updateAvatar} />
        </div>
      </div>

      <div id="change-password-modal" className="modal">
        <ChangePasswordModal />
      </div>

      <div id="change-username-modal" className="modal">
        <ChangeUsernameModal setUser={setUser} user={user} />
      </div>

      <div id="withdrawModal" className="modal">
        <WithdrawModal setUser={setUser} />
      </div>

      <div id="deleteModal" className="modal">
        <div className="modal-content">
          <h4>Are you sure you want to delete this image?</h4>
        </div>
        <div className="modal-footer">
          <a
            href="#!"
            onClick={() => {
              deleteImage();
            }}
            className="modal-close waves-effect waves-green btn-flat"
          >
            Confirm
          </a>
          <a
            href="#!"
            className="modal-close waves-effect waves-green btn-flat"
          >
            Cancel
          </a>
        </div>
      </div>
      <ul id="edit-dropdown" className="dropdown-content">
        {user.thirdPartyId ? null : (
          <li>
            {" "}
            <a className="modal-trigger" href="#change-password-modal">
              Change Password
            </a>
          </li>
        )}
        <li>
          <a className="modal-trigger" href="#change-username-modal">
            Change Username
          </a>
        </li>
        <li>
          <a className="modal-trigger" href="#editModal">
            Change Avatar
          </a>
        </li>
      </ul>
    </div>
  );
}
