import React from 'react'

export default function ImageCardMedia(props) {
    const {
        fileType,
        fileName,
        paymentRequired,
        payStatus,
        height,
        width,
    } = props.imageData;
    const { share, profile } = props;

    const media = () => {
        let lock = "";
        if (paymentRequired && profile && payStatus === false) {
            lock = (
                <i
                    className="material-icons large lock tooltipped"
                    data-position="bottom"
                    data-tooltip="This image requires a payment click to learn more"
                >
                    lock
                </i>
            );
        }

        if (fileType === "mp4") {
            if (share) {
                return (
                    <div className="place-holder-container purple">
                        <div className="place-holder" style={{ paddingBottom: height / width * 100 + '%' }}></div>
                        <video autoPlay muted loop className="responsive-mp4">
                            <source src={"/api/i/" + fileName} type="video/mp4" />
                        </video>
                    </div>
                );
            } else {
                return (
                    <div className="place-holder-container purple">
                        <div className="place-holder" style={{ paddingBottom: height / width * 100 + '%' }}></div>
                        <video
                            disableremoteplayback={"true"}
                            autoPlay
                            muted
                            loop
                            className="responsive-mp4 background"
                        >
                            <source src={"/api/i/" + fileName} type="video/mp4" />
                        </video>
                        {lock}
                    </div>
                );
            }
        }
        if (fileType === "gif") {
            return (
                <div className='place-holder-container purple'>
                    <div className="place-holder" style={{ paddingBottom: height / width * 100 + '%' }}></div>
                    <img className='background' src={"/api/i/" + fileName} alt="image"></img>
                    {lock}
                </div>
            );
        }
        if (share) {
            return (
                <div className='place-holder-container purple'>
                    <div style={{ paddingBottom: height / width * 100 + '%' }}></div>
                    <img
                        className="img-payment-required background"
                        src={"/api/i/" + fileName}
                        alt="image"
                        loader={<div style={{ paddingBottom: height / width * 100 + '%', backgroundColor: 'purple' }}></div>}
                    ></img>
                    {lock}
                </div >
            );
        }
        return (
            <div className='place-holder-container purple'>
                <div style={{ paddingBottom: height / width * 100 + '%' }}></div>
                <img
                    className="img-payment-required"
                    src={"/api/t/" + fileName}
                    alt="image"
                ></img>

                {lock}
            </div >
        );
    };

    return (
        <div>
            {media()}
        </div>
    )
}




