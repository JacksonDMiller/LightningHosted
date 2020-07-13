import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import CommentSection from './CommentSection'

export default function Share(props) {
    const [imageData, setImageData] = useState({});
    let { imageId } = useParams();

    useEffect(() => {

        const getImageInfo = async () => {
            const res = await fetch('/api/imageinfo/' + imageId)
            const imageData = await res.json();
            console.log(imageData)
            setImageData(imageData)
            if (!localStorage.getItem(imageData.imageId)) {
                localStorage.setItem(imageData.imageId, true);
                fetch('/api/incrementPageView/' + imageData.imageId)
                console.log('itsnew')
            }
        }
        getImageInfo();
    }, [])

    const reportImage = async (imageId) => {
        const res = await fetch('/api/report/' + imageId)
    }
    return (
        <div>
            <div className='container row'>
                {imageData.imageId ?
                    <div className="col s8 offset-s2">
                        <div className="card">
                            <div className="card-title center-align">This is the Card Title</div>
                            <div className="card-image">
                                {imageData.fileType === 'mp4' ? <video controls autoPlay loop className='responsive-video'> <source src={"/api/i/" + imageData.fileName} type="video/mp4" /></video>
                                    : <img src={"/api/i/" + imageData.fileName} alt="image" />}

                            </div>
                            <div className="card-content">
                                <p className="flow-text">This is the caption someone will make.</p>
                            </div>
                        </div>
                        <button className='btn' onClick={() => reportImage(imageId)}>Report</button>
                    </div>
                    : null}

            </div>
            {imageData.comments ? <CommentSection imageId={imageData.imageId} comments={imageData.comments} /> : null}
        </div>
    )
}
