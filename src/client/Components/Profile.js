import React, { useState, useEffect } from 'react'
import Uploader from './Uploader';
import ImageCard from './ImageCard';
import Masonry from 'react-masonry-css'
import { Redirect } from 'react-router-dom'
import AvatarUploader from './AvatarUploader';

export default function Profile() {
    const [images, setImages] = useState([])
    const [invoice, setInvoice] = useState(null)
    const [loggedIn, setLoggedIn] = useState(true)
    const [user, setUser] = useState({})
    const [newUserName, setNewUserName] = useState(null)

    document.addEventListener('DOMContentLoaded', function () {
        var elems = document.querySelectorAll('.modal');
        var instances = M.Modal.init(elems);
    });

    useEffect(() => {



        const fetchData = async () => {
            const res = await fetch('/api/profileinfo/');
            if (res.status === 401) {
                return <Redirect to='/'></Redirect>
                setLoggedIn(false);
            }
            else {
                const data = await res.json();
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
    }

    const deleteImage = async (imageId) => {
        const res = await fetch('/api/deleteimage/' + imageId);
        if (res.status === 200) {
            console.log(images)
            const newImages = images.filter((image) => {
                if (image.imageId !== imageId) {
                    return image
                }
            })
            setImages(newImages)
        }
    }


    const addImage = (image) => {
        const newImages = [image, ...images]
        setImages(newImages)
    }

    const updateAvatar = (user) => {
        setUser(user)
    }

    const updateUserName = async () => {
        const res = await fetch('/api/changeusername/' + newUserName);
        const result = await res.json();
        console.log(res)
        if (res.status === 200) {
            setUser({ ...user, userName: newUserName })
        }

    }

    return (
        <div className='' >
            {!loggedIn ? <Redirect to='/' /> : null}
            <div>
                {user.avatar ? <img className='circle' src={'/api/avatar/' + user.avatar} style={{ width: '100px' }}></img> : null}
                <p>{user.userName}</p>
                <p>Sats: {user.earnedSats} </p>
                <p>Views: {user.views} </p>
                <p>Upvotes: {user.upvotes} </p>
                <a className="waves-effect waves-light btn modal-trigger" href="#modal1">Edit</a>

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


            <div id="modal1" className="modal">
                <div className="modal-content">
                    <h4>Choose a new avatar</h4>
                    <AvatarUploader updateAvatar={updateAvatar} />
                </div>
                <div className="input-field col s10">
                    <i className="material-icons prefix">mode_edit</i>
                    <textarea id="icon_prefix5" className="materialize-textarea" onChange={(e) => {
                        setNewUserName(e.target.value)
                    }}></textarea>
                    <label htmlFor="icon_prefix5">New Username</label>
                    <button onClick={updateUserName}>Submit</button>
                </div>
            </div>
        </div >
    )
}
