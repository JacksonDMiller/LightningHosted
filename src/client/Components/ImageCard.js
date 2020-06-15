import React from 'react'
import M from 'materialize-css/dist/js/materialize.min.js'


const ImageCard = (props) => {
    return (
        <div className="col s12 m4 l3">
            <div className="card">
                <div className="card-title center-align">Card Title</div>
                <div className="card-image">
                    {props.imageData.fileType === 'mp4' ? <video controls autoPlay loop className='responsive-video'> <source src={"/api/i/" + props.imageData.fileName} type="video/mp4" /></video>
                        : <img src={"/api/i/" + props.imageData.fileName} alt="image" />}

                </div>
                <div className="card-content">
                    <p className="flow-text">This is the comment someone will make.</p>
                </div>
            </div>
        </div>
    )
}

export default ImageCard; 
