import React, { useContext } from 'react';
import { viewportContext } from '../Context/GetWindowDimensions'

export const HorizontalAd = () => {
    const { screenWidth } = useContext(viewportContext);

    const ad = () => {
        if (screenWidth >= 1000) {
            return <iframe className='center ad'
                data-aa="1259137" src="//ad.a-ads.com/1259137?size=728x90"
                scrolling="no"
                style={{ width: '728px', height: '90px', border: '0px', padding: 0, overflow: 'hidden' }}
                allowtransparency="true">

            </iframe>
        }
        if (screenWidth >= 800) {
            return <iframe className='center ad'
                data-aa="1259139" src="//ad.a-ads.com/1259139?size=468x60"
                scrolling="no"
                style={{ width: '468px', height: '60px', border: '0px', padding: 0, overflow: "hidden" }}
                allowtransparency="true">

            </iframe>
        }
        else {
            return <iframe
                className='center ad'
                data-aa="1443703"
                src="//ad.a-ads.com/1443703?size=320x50"
                scrolling="no"
                style={{ width: '320px', height: '50px', border: '0px', padding: 0, overflow: 'hidden' }}
                allowtransparency="true"></iframe>
        }
    }


    return (
        <span>
            {ad()}
        </span>
    )
}





