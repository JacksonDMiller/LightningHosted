import React from 'react'
import M from 'materialize-css/dist/js/materialize.min.js'



export default function ImageCard(props) {
    const upvote = async (imageId) => {
        var res = await fetch('/api/upvote/' + imageId);
        console.log(await res.json())
    }
    return (

        <div className="col s12 m4 l3">
            <div className="card">
                <div className="card-title center-align">Card Title</div>
                <a href={'/s/' + props.imageData.imageId}>
                    <div className="card-image">
                        {props.imageData.fileType === 'mp4' ? <video autoPlay muted loop className='responsive-video'> <source src={"/api/i/" + props.imageData.fileName} type="video/mp4" /></video>
                            : <img src={"/api/i/" + props.imageData.fileName} alt="image" />}

                    </div>
                </a>
                <div className="card-content row">
                    <span className="col s4"><i onClick={() => upvote(props.imageData.imageId)} className="material-icons ">arrow_drop_up</i> {props.imageData.upVotes}</span>
                    <span className="col s4"><i className="material-icons">remove_red_eye</i> {props.imageData.views}</span>
                    <span className="col s4"><i className="material-icons">comment</i> {props.imageData.numberOfComments}</span>
                    <p className="flow-text">This is the comment someone will make.</p>
                </div>
            </div>
        </div >

    )
}
