import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom'
import CommentSection from './CommentSection'
import ImageCard from './ImageCard'
import { viewportContext } from '../Context/GetWindowDimensions'

export default function Share(props) {
    const [imageData, setImageData] = useState({});
    let { imageId } = useParams();
    const { width } = useContext(viewportContext);

    useEffect(() => {
        // grab the image and image info
        const getImageInfo = async () => {
            const res = await fetch('/api/imageinfo/' + imageId)
            const imageData = await res.json();
            setImageData(imageData)
            // attempt to record a view if the the localStorage does not indicate they
            // have seen this image before
            if (!localStorage.getItem(imageData.imageId)) {
                localStorage.setItem(imageData.imageId, true);
                fetch('/api/incrementPageView/' + imageData.imageId)
            }
        }
        getImageInfo();
    }, [])

    const reportImage = async (imageId) => {
        const res = await fetch('/api/report/' + imageId)
    }
    const incrementComments = () => {
        let incrementedComments = imageData.numberOfComments + 1
        setImageData({ ...imageData, numberOfComments: incrementedComments })
    }

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
            <div className=''>
                {imageData.imageId ?
                    <ImageCard share={true} imageData={imageData} />
                    : null}
            </div>
            {imageData.comments
                ? <CommentSection imageId={imageData.imageId} comments={imageData.comments} incrementComments={incrementComments} />
                : null}
        </div>
    )
}
