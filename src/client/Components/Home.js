import React, { Component } from 'react'
import Uploader from './Uploader';
import ImageCard from './ImageCard';
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from 'react-masonry-css'

export default class Home extends Component {
    state = {
        images: [],
        page: 0,
        hasMore: true,
    };

    getMoreImages = () => {
        fetch('/api/tt/' + this.state.page)
            .then(res => res.json())
            .then(imageData => {
                if (imageData.length === 0) {
                    this.setState({
                        hasMore: false
                    })
                }
                this.setState({
                    images: this.state.images.concat(imageData),
                    page: this.state.page + 1
                })
            });
    }

    componentDidMount() {
        this.getMoreImages()
    }

    render() {
        const { images } = this.state;
        return (
            <div>
                <Uploader />
                <InfiniteScroll

                    dataLength={images.length}
                    next={this.getMoreImages}
                    hasMore={this.state.hasMore}
                    loader={<h4>Loading...</h4>}
                    endMessage={
                        <p style={{ textAlign: 'center' }}>
                            <b>Yay! You have seen it all</b>
                        </p>
                    }
                >

                    <Masonry
                        breakpointCols={4}
                        className="my-masonry-grid"
                        columnClassName="my-masonry-grid_column">

                        {images ? images.map((image) => {
                            return <ImageCard key={image.imageId} imageData={image} />
                        }) : null}

                    </Masonry>
                </InfiniteScroll>
            </div >
        )
    }
}
