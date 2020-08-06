

import { useState, useEffect, useContext, } from 'react'
import ImageCard from './ImageCard';
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from 'react-masonry-css'
import React from 'react'
import { viewportContext } from '../Context/GetWindowDimensions'

export default function Home() {


    const [images, setImages] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { width } = useContext(viewportContext);

    const getMoreImages = async (position) => {
        const res = await fetch('/api/recomendedimages/' + page);
        const imageData = await res.json();
        if (imageData.length === 0) {
            setHasMore(false);
        }
        setPage(page + 1);
        if (position === 'top') {
            let arr = [...imageData, ...images]
            console.log(arr)
            setImages([...imageData, ...images]);
        }
        else {
            setImages(images.concat(imageData));
        }
    }

    useEffect(() => {
        getMoreImages();
    }, [])

    const ad = () => {
        if (width >= 1000) {
            return <iframe className='center ad'
                data-aa="1259137" src="//ad.a-ads.com/1259137?size=728x90"
                scrolling="no"
                style={{ width: '728px', height: '90px', border: '0px', padding: 0, overflow: 'hidden' }}
                allowtransparency="true">

            </iframe>
        }
        if (width >= 800) {
            return <iframe className='center ad'
                data-aa="1259139" src="//ad.a-ads.com/1259139?size=468x60"
                scrolling="no"
                style={{ width: '468px', height: '60px', border: '0px', padding: 0, overflow: "hidden" }}
                allowtransparency="true">

            </iframe>
        }
        else {
            return <iframe
                className='center ad'
                data-aa="1443703"
                src="//ad.a-ads.com/1443703?size=320x50"
                scrolling="no"
                style={{ width: '320px', height: '50px', border: '0px', padding: 0, overflow: 'hidden' }}
                allowtransparency="true"></iframe>
        }
    }

    return (
        <div className=''>
            {ad()}

            {/* 
          



           */}
            <InfiniteScroll
                dataLength={images.length}
                next={getMoreImages}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={
                    <p style={{ textAlign: 'center' }}>
                        <b>Yay! You have seen it all</b>
                    </p>
                }
                refreshFunction={() => getMoreImages('top')}
                pullDownToRefresh={true}
                pullDownToRefreshContent={
                    <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                }
                releaseToRefreshContent={
                    <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                }
                pullDownToRefreshThreshold={100}
            >

                <Masonry
                    breakpointCols={
                        {
                            default: 6,
                            1200: 4,
                            900: 3,
                            700: 2,
                            500: 1
                        }}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column">

                    {images ? images.map((image, index) => {
                        // this is weird im not sure why there is a key collision with the imageId added index to the key to stop it.
                        return <ImageCard key={image.imageId + index} imageData={image} />
                    }) : null}

                </Masonry>
            </InfiniteScroll>
        </div >
    )

}