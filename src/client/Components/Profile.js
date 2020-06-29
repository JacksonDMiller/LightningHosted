import React, { useState, useEffect } from 'react'
import Uploader from './Uploader';
import ImageCard from './ImageCard';
import Masonry from 'react-masonry-css'
import { Redirect } from 'react-router-dom'
import Navbar from './Navbar';

export default function Profile() {
    const [images, setImages] = useState([])
    const [invoice, setInvoice] = useState(null)
    const [loggedIn, setLoggedIn] = useState(true)
    const [user, setUser] = useState({})

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('/api/profileinfo/');
            if (res.status === 401) {
                console.log('not authorezed');
                setLoggedIn(false);
            }
            else {
                const data = await res.json();
                console.log(data)
                const sortedImages = data.images.sort((a, b) => new Date(b.date) - new Date(a.date))
                setImages(sortedImages);
                setUser(data)
            }
        }
        fetchData();
    }, [])

    const withdraw = async (e) => {
        e.preventDefault()
        const res = await fetch('/api/payinvoice/' + invoice);
        const data = await res.json();
        console.log(data);
    }

    const deleteImage = async (imageId) => {
        const res = await fetch('/api/deleteimage/' + imageId);
        // const data = await res.json();
        // console.log(res)
        if (res.status === 200) {
            console.log(images)
            const newImages = images.filter((image) => {
                if (image.imageId !== imageId) {
                    return image
                }
            })
            console.log(newImages)
            setImages(newImages)
        }
    }


    const addImage = (image) => {
        const newImages = [image, ...images]
        console.log(newImages)
        setImages(newImages)
    }
    return (
        <div className='' >
            {!loggedIn ? <Redirect to='/' /> : null}
            <Navbar auth={true} />
            <div>
                <img src={user.avatar} style={{ width: '100px' }}></img>
                <p>{user.userName}</p>
                <p>Sats: {user.earnedSats} </p>
                <p>Views: {user.views} </p>
                <p>Upvotes: {user.upvotes} </p>
            </div>
            <form className="col s12">
                <div className="row">
                    <div className="input-field col s10">
                        <i className="material-icons prefix">mode_edit</i>
                        <textarea id="icon_prefix2" className="materialize-textarea" onChange={(e) => {
                            setInvoice(e.target.value)
                        }}></textarea>
                        <label htmlFor="icon_prefix2">Lightning Invoice</label>
                    </div>
                    <button onClick={withdraw} className='btn col s2'>Withdraw</button>
                </div>
            </form>

            <Uploader addImage={addImage} />

            <Masonry
                breakpointCols={4}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column">

                {images ? images.map((image) => {
                    return <div key={image.imageId}> <ImageCard imageData={image} />
                        <button onClick={() => { deleteImage(image.imageId) }}>Delete</button>
                    </div>
                }) : null}

            </Masonry>
        </div >
    )
}
