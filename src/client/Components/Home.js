

import { useState, useEffect, useContext } from 'react'
import ImageCard from './ImageCard';
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from 'react-masonry-css'
import { store } from '../Context/Store';

import React from 'react'

export default function Home() {
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [auth, setAuth] = useState(false);

    const globalState = useContext(store);
    const { dispatch } = globalState;

    const isLoggedIn = async () => {
        const res = await fetch('/api/checkifauthorized/');
        if (await res.json() === true) {
            dispatch({ type: 'LOGIN' })
        }
        else { dispatch({ type: 'LOGOUT' }) }
    };

    const getMoreImages = async () => {
        const res = await fetch('/api/recomendedimages/' + page);
        const imageData = await res.json();
        if (imageData.length === 0) {
            setHasMore(false);
        }
        setImages(images.concat(imageData));
        setPage(page + 1);
    }

    useEffect(() => {
        getMoreImages();
        isLoggedIn();
    }, [])



    return (
        <div className=''>
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
            >

                <Masonry
                    breakpointCols={
                        {
                            default: 4,
                            1100: 3,
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