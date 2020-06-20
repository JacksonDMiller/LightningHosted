import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'


export default function Share(props) {
    const [imageData, setImageData] = useState({});
    let { imageId } = useParams();

    useEffect(() => {
        fetch('/api/ii/' + imageId)
            .then((res) => res.json())
            .then((res) => {
                setImageData(res)
                console.log(res)
            })
    }, [])


    return (
        <div className='container row'>
            {imageData.imageId ?
                <div className="col s8 offset-s2">
                    <div className="card">
                        <div className="card-title center-align">This is the Card Title</div>
                        <div className="card-image">
                            {imageData.fileType === 'mp4' ? <video controls autoPlay loop className='responsive-video'> <source src={"/api/i/" + props.imageData.fileName} type="video/mp4" /></video>
                                : <img src={"/api/i/" + imageData.fileName} alt="image" />}

                        </div>
                        <div className="card-content">
                            <p className="flow-text">This is the caption someone will make.</p>
                        </div>
                    </div>
                </div>
                : null}
        </div>

    )
}
