import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { store } from '../Context/Store';
import { viewportContext } from '../Context/GetWindowDimensions'


export default function ImageCard(props) {
    const globalState = useContext(store);
    const { dispatch } = globalState;

    const { imageId,
        fileType,
        fileName,
        caption,
        title,
        views,
        numberOfComments,
        orientation,
        paymentRequired,
        payStatus
    } = props.imageData

    useEffect(() => {
        var elems = document.querySelectorAll('.tooltipped');
        var instances = M.Tooltip.init(elems,);
        return () => {
            if (instances.length) {
                instances.forEach(instance => instance.destroy());
            }
        }
    }, [])



    const [upvotes, setUpovotes] = useState(props.imageData.upvotes)

    const { width } = useContext(viewportContext);
    const [upvoted, setUpvoted] = useState(() => {
        if (globalState.state.upvoted && globalState.state.upvoted.includes(imageId)) {
            return 'upvoted';
        }
        else { return }
    })



    const { profile, share } = props
    const upvote = async (imageId) => {
        if (globalState.state.auth === false) {
            M.toast({ html: "<a href='/login'>Please Login First</a>" })
        }
        else {
            if (!globalState.state.upvoted.includes(imageId)) {
                setUpovotes(upvotes + 1)
                setUpvoted('upvoted')
            }
            else {
                setUpovotes(upvotes - 1)
                setUpvoted('')
            }
            const res = fetch('/api/upvote/' + imageId);
            const data = await (await res).json();
            dispatch({ type: 'UPDATE', payload: data.user });
        }
    }

    const media = () => {
        let lock = ''
        if (paymentRequired && profile && payStatus === false) {
            lock = <div
                className="lock valign-wrapper tooltipped"
                data-position="bottom"
                data-tooltip="This image requires a payment click to learn more">
                <span className='center-align center'>
                    <i className="material-icons large">lock</i>
                </span>
            </div>
        }


        if (fileType === 'mp4') {
            if (share) {
                return <span><video autoPlay muted loop className="responsive-mp4">
                    <source src={"/api/i/" + fileName} type="video/mp4" />
                </video>
                    {lock}
                </span>
            }
            else {
                return <span><video disableremoteplayback={'true'} autoPlay muted loop className="responsive-mp4">
                    <source src={"/api/i/" + fileName} type="video/mp4" />
                </video>
                    {lock}
                </span>
            }
        }
        if (fileType === 'gif') {
            return <span>< img src={"/api/i/" + fileName} alt="image" ></img>
                {lock}
            </span>
        }
        if (share) {
            return <span><img className='img-payment-required' src={"/api/i/" + fileName} alt="image"></img>
                {lock}
            </span>
        }
        return <span><img className='img-payment-required' src={"/api/t/" + fileName} alt="image"></img>
            {lock}
        </span>
    }

    const containerClasses = () => {
        if (share) {
            return "card center " + orientation + '-own'
        }
        if (width < 500) {
            return 'card'
        }
        else { return 'card card-hover' }
    }

    return (
        <div className={containerClasses()}>
            {title ? <div>
                <p className="flow-text black-text caption-text">{title}</p>
            </div> : null}
            {share ?
                <div>
                    <div className="card-image">

                        {media()}
                    </div>
                    {caption ? <div>
                        <p className="flow-text black-text caption-text">{caption}</p>
                    </div> : null}
                </div> :
                <Link to={'/s/' + imageId}>
                    <div className="card-image">

                        {media()}
                    </div>
                    {caption ?
                        <div>
                            <p className="flow-text black-text caption-text">{caption.length > 60 ? caption.substring(0, 60) + '...' : caption}</p>
                        </div> : null}
                </Link>}

            {profile ?
                <div className="card-content row profile-image-stats">
                    <span className="center-align col s3 ">
                        {globalState.state.upvoted.includes(imageId) ? < i onClick={(e) => upvote(imageId, e)}
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
                        < i onClick={() => upvote(imageId)}
                            className={"material-icons image-icon upvote " + upvoted}>keyboard_arrow_up</i>
                        {upvotes}
                    </span>
                    <Link to={'/s/' + imageId}>
                        {/* avoid showing 0 views when you are the first viewer */}
                        {share ?
                            <span className="center-align col s4 ">
                                <i className="material-icons image-icon">remove_red_eye</i> {views + 1}
                            </span> :
                            <span className="center-align col s4 ">
                                <i className="material-icons image-icon">remove_red_eye</i> {views}
                            </span>
                        }

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
