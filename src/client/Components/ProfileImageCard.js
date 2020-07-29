import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom'
import { store } from '../Context/Store';


export default function ProfileImageCard(props) {
    const [upvotes, setUpovotes] = useState(props.imageData.upvotes)
    const globalState = useContext(store);
    const { imageId,
        fileType,
        fileName,
        caption,
        views,
        numberOfComments,
    } = props.imageData

    const upvote = async (imageId) => {
        // this function needs update the global state so you can only attempt to upvote once
        if (!globalState.state.upvoted.includes(imageId)) {
            fetch('/api/upvote/' + imageId);
            setUpovotes(upvotes + 1)
        }
        else { console.log(`already upvoted`) }
    }
    return (

        <div className="imageCard card">
            <Link to={'/s/' + imageId}>
                <div className="card-image">
                    {fileType === 'mp4' ?
                        <video autoPlay muted loop className='responsive-video'>
                            <source src={"/api/i/" + fileName} type="video/mp4" />
                        </video>
                        : fileType === 'gif' ? < img src={"/api/i/" + fileName} alt="image" />
                            : <img src={"/api/t/" + fileName} alt="image" />}

                </div>
            </Link>
            <div className="card-content row profile-image-stats">
                <span className="center-align col s3 ">
                    {globalState.state.upvoted.includes(imageId) ? < i onClick={() => upvote(imageId)}
                        className="material-icons image-icon upvoted upvote">keyboard_arrow_up</i> :
                        < i onClick={() => upvote(imageId)}
                            className="material-icons image-icon upvote">keyboard_arrow_up</i>
                    }
                    {upvotes}
                </span>
                <Link to={'/s/' + imageId}>
                    <span className="center-align col s3 ">
                        <i className="material-icons image-icon">remove_red_eye</i> {views}
                    </span>
                </Link>
                <Link to={'/s/' + imageId}>
                    <span className="center-align col s3 ">
                        <i className="material-icons image-icon">comment</i> {numberOfComments}
                    </span>
                </Link>

                <a onClick={() => { props.deleteImage(imageId) }}>
                    <span className="center-align col s3 ">
                        <i className="material-icons image-icon">delete</i>
                    </span>
                </a>
                <p className="flow-text">{caption}</p>
            </div>

            <div id="modal1" className="modal modal-fixed-footer">
                <div className="modal-content">
                    <h4>Modal Header</h4>
                    <p>A bunch of text</p>
                </div>
                <div className="modal-footer">
                    <a href="#!" className="modal-close waves-effect waves-green btn-flat">Agree</a>
                </div>
            </div>



        </div >

    )
}

