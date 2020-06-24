import React, { Component } from 'react'
import Uploader from './Uploader';
import ImageCard from './ImageCard';
import Masonry from 'react-masonry-css'

export default class Profile extends Component {
    state = {
        images: [],
    };

    getUserData = async () => {
        var res = await fetch('/api/pi/')
        if (res.status === 401) {
            console.log('not authorezed')
        }
        res = await res.json()
        this.setState({
            images: res.images,
        })
        // });
    }

    componentDidMount() {
        this.getUserData()
    }

    render() {
        const { images } = this.state;
        return (
            <div className='container'>
                <Uploader />

                <Masonry
                    breakpointCols={4}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column">

                    {images ? images.map((image) => {
                        return <ImageCard key={image.imageId} imageData={image} />
                    }) : null}

                </Masonry>
            </div >
        )
    }
}
