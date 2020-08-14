// image Data wont stay saved in the state for some reason 


import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom'
import CommentSection from './CommentSection'
import ImageCard from './ImageCard'
import { viewportContext } from '../Context/GetWindowDimensions'
var QRCode = require('qrcode.react');
import { HorizontalAd } from '../Components/HorizontalAd'


export default function Share() {
    const [imageData, setImageData] = useState({});
    let { imageId } = useParams();
    const { width } = useContext(viewportContext);
    var checkPaymentInterval = null;

    const getImageInfo = async () => {
        const newImageData = await (await fetch('/api/imageinfo/' + imageId)).json()
        await newImageData
        setImageData(newImageData)
        if (newImageData.paymentRequired && newImageData.payStatus === false) {
            checkForPayment(newImageData.paymentRequest)
        }
        // attempt to record a view if the the localStorage does not indicate they
        // have seen this image before
        if (!localStorage.getItem(newImageData.imageId)) {
            localStorage.setItem(newImageData.imageId, true);
            fetch('/api/incrementPageView/' + newImageData.imageId)
        }

    }

    useEffect(() => {
        // grab the image and image info

        getImageInfo();
        return () => {
            clearInterval(checkPaymentInterval);
        }
    }, [])

    const checkForPayment = (paymentRequest) => {

        var counter = 0
        checkPaymentInterval = setInterval(async () => {
            console.log('checked')
            counter = counter + 1
            if (counter === 300) {
                clearInterval(checkPaymentInterval)
            }
            let res = await fetch('/api/checkpayment/' + paymentRequest)
            if (res.status === 200) {
                console.log('it was 2002222222222')
                const paidImageData = await res.json();
                setImageData(paidImageData.imageData);
                clearInterval(checkPaymentInterval);
                M.toast({ html: 'Paid!' });
            }
            if (res.status === 400) {
                clearInterval(checkPaymentInterval);

            }

        }, 1000);
    }

    // has not been hooked up yet
    const reportImage = async (imageId) => {
        const res = await fetch('/api/report/' + imageId)
    }

    const incrementComments = () => {
        let incrementedComments = imageData.numberOfComments + 1
        setImageData({ ...imageData, numberOfComments: incrementedComments })
    }

    return (

        <div className=''>
            <HorizontalAd />
            {imageData.paymentRequired && imageData.payStatus === false ?

                < div className="container">
                    <h3 className="center-align">100 Sats</h3>
                    <QRCode onLoad={() => checkForPayment()} className='qr-code center' value={imageData.paymentRequest} />
                    <a href={"lightning:" + imageData.paymentRequest}><button className="btn center">Pay</button></a>
                    <p className="center-align">This image requires a deposit.</p>
                    <p className="center-align">We use a small lightning network payment as a deterrent to people abusing the service.
                    After the image recevies 100 views the satoshis are credited to the creator of the image for withdrawal.</p>



                </div>

                :
                <span>

                    <div className=''>
                        {imageData.imageId ?
                            <ImageCard share={true} imageData={imageData} />
                            : null}
                    </div>
                    {imageData.comments
                        ? <CommentSection imageId={imageData.imageId} comments={imageData.comments} incrementComments={incrementComments} />
                        : null}
                </span>
            }
        </div >
    )
}
