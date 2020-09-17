// image Data wont stay saved in the state for some reason

import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import CommentSection from "./SharePageComponents/CommentSection";
import ImageCard from "./ImageCardComponents/ImageCard";
import HorizontalAd from "./HorizontalAd";
import { viewportContext } from "../Context/GetWindowDimensions";
import { store } from "../Context/Store";
const QRCode = require("qrcode.react");
import Helmet from "react-helmet";
import ReactGA from "react-ga";

export default function Share() {
  const globalState = useContext(store);
  const [imageData, setImageData] = useState({});
  let { imageId } = useParams();
  const { screenWidth } = useContext(viewportContext);
  var checkPaymentInterval = null;

  const getImageInfo = async () => {
    const newImageData = await (
      await fetch("/api/imageinfo/" + imageId)
    ).json();
    await newImageData;
    setImageData(newImageData);
    if (newImageData.paymentRequired && newImageData.payStatus === false) {
      checkForPayment(newImageData.paymentRequest);
    }
    // attempt to record a view if the the localStorage does not indicate they
    // have seen this image before
    if (!localStorage.getItem(newImageData.imageId)) {
      localStorage.setItem(newImageData.imageId, true);
      fetch("/api/incrementPageView/" + newImageData.imageId);
    }
  };

  useEffect(() => {
    ReactGA.pageview(`/s/${imageId}`);

    // grab the image and image info

    getImageInfo();
    return () => {
      clearInterval(checkPaymentInterval);
    };
  }, []);

  const checkForPayment = (paymentRequest) => {
    var counter = 0;
    checkPaymentInterval = setInterval(async () => {
      console.log("checked");
      counter = counter + 1;
      if (counter === 300) {
        clearInterval(checkPaymentInterval);
      }
      let res = await fetch("/api/checkpayment/" + paymentRequest);
      if (res.status === 200) {
        const paidImageData = await res.json();
        setImageData(paidImageData.imageData);
        clearInterval(checkPaymentInterval);
        M.toast({ html: "Paid!" });
      }
      if (res.status === 400) {
        clearInterval(checkPaymentInterval);
      }
    }, 1000);
  };

  // has not been hooked up yet
  const reportImage = async (imageId) => {
    const res = await fetch("/api/report/" + imageId);
  };

  const incrementComments = () => {
    let incrementedComments = imageData.numberOfComments + 1;
    setImageData({ ...imageData, numberOfComments: incrementedComments });
  };

  const { views, upvotes, title, filename, height } = imageData;

  return (
    <div className="">
      <Helmet>
        {title ? (
          <title>{"LH - " + title}</title>
        ) : (
          <title>LightningHosted</title>
        )}
        <meta
          name="description"
          content={
            views + " views and " + upvotes + " upvotes on LightningHosted.com"
          }
        />
        <link
          rel="canonical"
          href={"https://LightningHosted.com/s/" + filename}
        />
        <meta name="twitter:title" content={title} />
        <link
          rel="image_src"
          href={"https://lightninghosted.com/api/i/" + filename}
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:url"
          content={"https://LightningHosted.com/s/" + imageId}
        />
        <meta property="og:image:width" content={imageData.width} />
        <meta property="og:image:height" content={height} />
        <meta
          property="og:description"
          content={
            views + " views and " + upvotes + " upvotes on LightningHosted.com"
          }
        />
        <meta
          name="twitter:description"
          content={
            views + " views and " + upvotes + " upvotes on LightningHosted.com"
          }
        />
        <meta
          name="twitter:image"
          content={"https://lightninghosted.com/api/i/" + filename}
        />
        <meta
          property="og:image"
          content={"https://lightninghosted.com/api/i/" + filename}
        />
      </Helmet>

      <HorizontalAd />
      {imageData.deleted ? (
        <p>This post has been deleted</p>
      ) : (
        <span>
          {imageData.paymentRequired && imageData.payStatus === false ? (
            <div className="container">
              <h3 className="center-align">100 Sats</h3>
              <QRCode
                onLoad={() => checkForPayment()}
                className="qr-code center"
                value={imageData.paymentRequest}
              />
              <a href={"lightning:" + imageData.paymentRequest}>
                <button className="btn center">Pay</button>
              </a>
              <p className="center-align">This image requires a deposit.</p>
              <p className="center-align">
                We use a small lightning network payment as a deterrent to
                people abusing the service. After the image recevies 100 views
                the satoshis are credited to the creator of the image for
                withdrawal.
              </p>
            </div>
          ) : (
            <span>
              <div className="">
                {imageData.imageId ? (
                  <ImageCard share={true} imageData={imageData} />
                ) : null}
                {console.log()}
                {globalState.state.moderator ? (
                  <div className="center">
                    <button
                      onClick={() =>
                        fetch("/api/moderatorsuppressimage/" + imageId)
                      }
                      className="btn"
                    >
                      Supress
                    </button>
                    <button
                      onClick={() =>
                        fetch("/api/moderatordeleteimage/" + imageId)
                      }
                      className="btn"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
              {imageData.comments ? (
                <CommentSection
                  imageId={imageData.imageId}
                  comments={imageData.comments}
                  incrementComments={incrementComments}
                />
              ) : null}
            </span>
          )}{" "}
        </span>
      )}
    </div>
  );
}
