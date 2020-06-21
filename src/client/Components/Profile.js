import React, { Component } from 'react'
import Uploader from './Uploader';
import ImageCard from './ImageCard';
import Masonry from 'react-masonry-css'

export default class Profile extends Component {
    state = {
        images: [],
    };

    getUserData = () => {
        fetch('/api/pi/')
            .then(res => res.json())
            .then(userData => {
                
                this.setState({
                    images: userData.images,
                })
            });
    }

    componentDidMount() {
        this.getUserData()
    }

    render() {
        const { images } = this.state;
        return (
            <div>
                <Uploader/>

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
