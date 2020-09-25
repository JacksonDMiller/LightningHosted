import React, { useState, useContext } from "react";
import { store } from "../../Context/Store";
import { Link } from "react-router-dom";
import ReactGA from "react-ga";
import useClipboard from "react-use-clipboard";

export default function ImageCardBottomBar(props) {
  const globalState = useContext(store);
  const { dispatch } = globalState;

  const { imageId, views, numberOfComments, title } = props.imageData;
  const { share, profile } = props;
  const [isCopied, setCopied] = useClipboard(
    `https://LightningHosted.com/s/${imageId}`
  );

  const [upvoted, setUpvoted] = useState(() => {
    if (
      globalState.state.upvoted &&
      globalState.state.upvoted.includes(imageId)
    ) {
      return "upvoted";
    } else {
      return "";
    }
  });
  const [upvotes, setUpovotes] = useState(props.imageData.upvotes);

  const upvote = async (imageId) => {
    if (globalState.state.auth === false) {
      M.toast({ html: "<a href='/login'>Please Login First</a>" });
    } else {
      if (!globalState.state.upvoted.includes(imageId)) {
        setUpovotes(upvotes + 1);
        setUpvoted("upvoted");
        ReactGA.event({
          category: "User",
          action: "Upvoted",
        });
      } else {
        setUpovotes(upvotes - 1);
        setUpvoted("");
      }
      const res = fetch("/api/upvote/" + imageId);
      const data = await (await res).json();
      dispatch({ type: "UPDATE", payload: data.user });
    }
  };

  return (
    <div>
      {profile || share ? (
        <div className="card-content row profile-image-stats">
          <span className="center-align col s3 ">
            <i
              onClick={(e) => upvote(imageId, e)}
              className={"material-icons image-icon upvote " + upvoted}
            >
              keyboard_arrow_up
            </i>
            {upvotes}
          </span>
          <Link to={"/s/" + imageId}>
            <span className="center-align col s3 ">
              <i className="material-icons image-icon">remove_red_eye</i>{" "}
              {views}
            </span>
          </Link>
          <Link to={"/s/" + imageId}>
            <span className="center-align col s3 ">
              <i className="material-icons image-icon">comment</i>{" "}
              {numberOfComments}
            </span>
          </Link>
          {share ? (
            <span className="center-align col s3">
              <a
                className="dropdown-trigger"
                href="#"
                data-target="share-dropdown"
              >
                <i
                  className="material-icons image-icon"
                  style={{ cursor: "pointer" }}
                >
                  share
                </i>
              </a>
              {/* Share Dropdown Structure  */}
              <ul id="share-dropdown" className="dropdown-content">
                <li>
                  <a
                    target="_blank"
                    href={
                      "https://www.reddit.com/submit?url=https://lightninghosted.com/s/" +
                      imageId +
                      "&title=" +
                      title
                    }
                  >
                    <i className="fa fa-reddit"></i>Reddit
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href={
                      "https://www.facebook.com/sharer/sharer.php?u=https://lightninghosted.com/s/" +
                      imageId
                    }
                  >
                    <i className="fa fa-facebook"></i>Facebook
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href={
                      "http://twitter.com/share?text=" +
                      title +
                      "&url=https://lightninghosted.com/s/" +
                      imageId +
                      "&hashtags=LightningHosted"
                    }
                  >
                    <i className="fa fa-twitter"></i>Twitter
                  </a>
                </li>
                <li>
                  <a
                    class="link-sytled-button"
                    target="_blank"
                    onClick={() => {
                      setCopied();
                      M.toast({ html: "Copied" });
                    }}
                  >
                    <i className="fa fa-copy"></i>Copy
                  </a>
                </li>
              </ul>
            </span>
          ) : (
            <a
              className="modal-trigger"
              href="#deleteModal"
              onClick={() => {
                props.deleteImage(imageId);
              }}
            >
              <span className="center-align col s3">
                <i
                  className="material-icons image-icon"
                  style={{ cursor: "pointer" }}
                >
                  delete
                </i>
              </span>
            </a>
          )}
        </div>
      ) : (
        <div className="card-content row image-stats">
          <span className="center-align col s4 ">
            <i
              onClick={() => upvote(imageId)}
              className={"material-icons image-icon upvote " + upvoted}
            >
              keyboard_arrow_up
            </i>
            {upvotes}
          </span>
          <Link to={"/s/" + imageId}>
            {/* avoid showing 0 views when you are the first viewer */}
            {share ? (
              <span className="center-align col s4 ">
                <i className="material-icons image-icon">remove_red_eye</i>{" "}
                {views + 1}
              </span>
            ) : (
              <span className="center-align col s4 ">
                <i className="material-icons image-icon">remove_red_eye</i>{" "}
                {views}
              </span>
            )}
          </Link>
          <Link to={"/s/" + imageId}>
            <span className="center-align col s4 ">
              <i className="material-icons image-icon">comment</i>{" "}
              {numberOfComments}
            </span>
          </Link>
          {share ? "hello" : null}
        </div>
      )}
    </div>
  );
}
