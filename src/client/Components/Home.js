import { useState, useEffect, useContext } from "react";
import ImageCard from "./ImageCardComponents/ImageCard";
import React from "react";
import HorizontalAd from "../Components/HorizontalAd";
import { viewportContext } from "../Context/GetWindowDimensions";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";
import ReactGA from "react-ga";
import { store } from "../Context/Store";

export default function Home() {
  const globalState = useContext(store);
  const { dispatch } = globalState;

  const { screenWidth } = useContext(viewportContext);
  const [images, setImages] = useState([]);
  const page = globalState.state.pageNumber;
  const [hasMore, setHasMore] = useState(true);
  let pageToGrab = page;

  const getMoreImages = async (position, initial) => {
    if (initial) {
    } else {
      dispatch({ type: "INCREMENTPAGE" });
      pageToGrab = page + 1;
    }

    const res = await fetch("/api/recomendedimages/" + pageToGrab);
    const imageData = await res.json();
    if (imageData.length === 0) {
      setHasMore(false);
    }

    if (position === "top") {
      let arr = [...imageData, ...images];
      console.log(arr);
      setImages([...imageData, ...images]);
    } else {
      setImages(images.concat(imageData));
    }
  };

  const isMobile = () => {
    if (screenWidth < 600) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    ReactGA.pageview(`/`);
    getMoreImages("bottom", true);
  }, []);

  return (
    <div className="home">
      <HorizontalAd />
      <InfiniteScroll
        dataLength={images.length}
        next={getMoreImages}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
        refreshFunction={() => getMoreImages("top")}
        pullDownToRefresh={isMobile()}
        pullDownToRefreshContent={
          <h3 style={{ textAlign: "center" }}>&#8595; Pull down to refresh</h3>
        }
        releaseToRefreshContent={
          <h3 style={{ textAlign: "center" }}>&#8593; Release to refresh</h3>
        }
        pullDownToRefreshThreshold={100}
        className="infinite-scroll"
      >
        <Masonry
          breakpointCols={{
            default: 6,
            1200: 4,
            900: 3,
            700: 2,
            500: 1,
          }}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {images
            ? images.map((image, index) => {
                // this is weird im not sure why there is a key collision with the imageId added index to the key to stop it.
                return (
                  <ImageCard key={image.imageId + index} imageData={image} />
                );
              })
            : null}
        </Masonry>
      </InfiniteScroll>
    </div>
  );
}
