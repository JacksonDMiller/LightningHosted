import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import CommentSection from './CommentSection'
import ImageCard from './ImageCard'

export default function Share(props) {
    const [imageData, setImageData] = useState({});
    let { imageId } = useParams();

    useEffect(() => {
        // grab the image and image info
        const getImageInfo = async () => {
            const res = await fetch('/api/imageinfo/' + imageId)
            const imageData = await res.json();
            console.log(imageData)
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

    return (
        <div>
            <div className='container row'>
                <div className='col m8 offset-m2'>
                    {imageData.imageId ?
                        <ImageCard share={true} imageData={imageData} />
                        : null}
                </div>
            </div>
            {imageData.comments
                ? <CommentSection imageId={imageData.imageId} comments={imageData.comments} incrementComments={incrementComments} />
                : null}
        </div>
    )
}
