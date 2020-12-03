import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { viewportContext } from "../../Context/GetWindowDimensions";
import ImageCardMedia from "./ImageCardMedia";
import ImageCardBottomBar from "./ImageCardBottomBar";
import Linkify from "react-linkify";

export default function ImageCard(props) {
  const { imageId, caption, title, orientation } = props.imageData;

  const { screenWidth } = useContext(viewportContext);

  const { profile, share } = props;

  useEffect(() => {
    var elems = document.querySelectorAll(".tooltipped");
    var instances = M.Tooltip.init(elems);
    var dropdownElems = document.querySelectorAll(".dropdown-trigger");
    var dropdownInstances = M.Dropdown.init(dropdownElems);
    return () => {
      if (instances.length) {
        instances.forEach((instance) => instance.destroy());
      }
    };
  }, []);

  const containerClasses = () => {
    if (share) {
      return "card center " + orientation + "-own";
    }
    if (screenWidth < 500) {
      return "card";
    } else {
      return "card card-hover";
    }
  };

  const ConditionalWrap = ({ condition, wrap, children }) =>
    condition ? wrap(children) : children;

  const imageTitle = () => {
    if (share) {
      return title;
    }
    if (title.length > 30) {
      return title.substring(0, 30) + "...";
    }
    if (title) {
      return title;
    }
    return null;
  };

  const imageCaption = () => {
    if (share) {
      return caption;
    }
    if (caption.length > 60) {
      return caption.substring(0, 60) + "...";
    }
    if (caption) {
      return caption;
    }
    return null;
  };
  return (
    <div className={containerClasses()}>
      <ConditionalWrap
        condition={!share}
        wrap={(children) => <Link to={"/s/" + imageId}>{children}</Link>}
      >
        {title ? <p className="title-text flow-text">{imageTitle()}</p> : null}
        <div className="card-image">
          <ImageCardMedia
            share={share}
            profile={profile}
            imageData={props.imageData}
          />
        </div>
        {caption ? (
          <Linkify>
            <p className="caption-text">{imageCaption()}</p>{" "}
          </Linkify>
        ) : null}
      </ConditionalWrap>

      <ImageCardBottomBar
        deleteImage={props.deleteImage}
        share={share}
        profile={profile}
        imageData={props.imageData}
      />
    </div>
  );
}
