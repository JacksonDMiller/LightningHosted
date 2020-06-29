import React from 'react'



export default function ImageCard(props) {
    var { imageId, fileType, fileName, title, caption, views, numberOfComments, upvotes } = props.imageData
    const upvote = async (imageId) => {
        var res = await fetch('/api/upvote/' + imageId);
        console.log(await res.json())
    }
    return (

        <div className="imageCard">
            <div className="card">
                <div className="card-title center-align">{title}</div>
                <a href={'/s/' + imageId}>
                    <div className="card-image">
                        {fileType === 'mp4' ? <video autoPlay muted loop className='responsive-video'> <source src={"/api/i/" + fileName} type="video/mp4" /></video>
                            : <img src={"/api/i/" + fileName} alt="image" />}

                    </div>
                </a>
                <div className="card-content row">
                    <span className="col s4"><i onClick={() => upvote(imageId)} className="material-icons ">arrow_drop_up</i> {upvotes}</span>
                    <span className="col s4"><i className="material-icons">remove_red_eye</i> {views}</span>
                    <span className="col s4"><i className="material-icons">comment</i> {numberOfComments}</span>
                    <p className="">{caption}</p>
                </div>
            </div>
        </div >

    )
}
