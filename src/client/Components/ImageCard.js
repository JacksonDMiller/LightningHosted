import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom'
import { store } from '../Context/Store';


export default function ImageCard(props) {
    const [upvotes, setUpovotes] = useState(props.imageData.upvotes)
    const globalState = useContext(store);
    const { dispatch } = globalState;

    const { imageId,
        fileType,
        fileName,
        caption,
        views,
        numberOfComments,
    } = props.imageData
    const { profile, share } = props
    const upvote = async (imageId) => {
        if (globalState.state.auth === false) {
            M.toast({ html: 'Please Login First' })
        }
        else {
            if (!globalState.state.upvoted.includes(imageId)) {
                setUpovotes(upvotes + 1)
            }
            else {
                setUpovotes(upvotes - 1)
            }
            const res = fetch('/api/upvote/' + imageId);
            const data = await (await res).json();
            console.log(data);
            dispatch({ type: 'UPDATE', payload: data.user });
        }
    }
    return (
        <div className="imageCard card hoverable">
            <Link to={'/s/' + imageId}>
                <div className="card-image">
                    {fileType === 'mp4' ?
                        <video autoPlay muted loop className='responsive-mp4'>
                            <source src={"/api/i/" + fileName} type="video/mp4" />
                        </video>
                        : fileType === 'gif' ? < img src={"/api/i/" + fileName} alt="image" />
                            : <img src={"/api/t/" + fileName} alt="image" />}

                </div>
                {caption ? <div>
                    <p className="flow-text black-text">{caption.length > 60 ? caption.substring(0, 60) + '...' : caption}</p>
                </div> : null}
            </Link>
            {profile ?
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
                    <a className="modal-trigger" href="#deleteModal" onClick={() => { props.deleteImage(imageId) }}>
                        <span className="center-align col s3">
                            <i className="material-icons image-icon" style={{ cursor: 'pointer' }}>delete</i>
                        </span>
                    </a>
                </div>

                :

                <div className="card-content row">
                    <span className="center-align col s4 ">
                        {globalState.state.upvoted && globalState.state.upvoted.includes(imageId) ? < i onClick={() => upvote(imageId)}
                            className="material-icons image-icon upvoted upvote">keyboard_arrow_up</i> :
                            < i onClick={() => upvote(imageId)}
                                className="material-icons image-icon upvote">keyboard_arrow_up</i>
                        }
                        {upvotes}
                    </span>
                    <Link to={'/s/' + imageId}>
                        <span className="center-align col s4 ">
                            <i className="material-icons image-icon">remove_red_eye</i> {views}
                        </span>
                    </Link>
                    <Link to={'/s/' + imageId}>
                        <span className="center-align col s4 ">
                            <i className="material-icons image-icon">comment</i> {numberOfComments}
                        </span>
                    </Link>
                </div>}

        </div >

    )
}
