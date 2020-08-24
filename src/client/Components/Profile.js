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
    const [imageToDelete, setImageToDelete] = useState('')
    const [editUsername, setEditUsername] = useState(false)
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newPasswordCheck, setNewPasswordCheck] = useState('')



    useEffect(() => {
        const elems = document.querySelectorAll('.modal');
        const instances = M.Modal.init(elems);
        const fetchData = async () => {
            const res = await fetch('/api/profileinfo/');
            if (res.status === 401) {
                setLoggedIn(false);
                return <Redirect to='/'></Redirect>
            }
            else {
                const data = await res.json();
                const sortedImages = data.images.sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                )
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
        if (data.error) {
            M.toast({ html: data.error })
        }
        else {
            M.toast({ html: "You just stacked sats for sharing an image. How cool is that?" })
            setUser(data.user)
        }
    }

    const openDeleteImage = async (imageId) => {
        setImageToDelete(imageId);
    }

    const deleteImage = async () => {
        const res = await fetch('/api/deleteimage/' + imageToDelete);
        if (res.status === 200) {
            const newImages = images.filter((image) => {
                if (image.imageId !== imageToDelete) {
                    return image
                }
            })
            setImages(newImages)
            setImageToDelete('');
        }
    }


    const addImage = (image) => {
        const newImages = [image, ...images]
        setImages(newImages)
    }

    const updateAvatar = (data) => {
        setUser({ ...user, avatarUrl: data.avatarUrl })
    }

    const updateUserName = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/changeusername/' + newUserName);
        const result = await res.json();
        if (res.status === 200) {
            setUser({ ...user, username: newUserName });
            setEditUsername(false);
        }
        else { M.toast({ html: result.error }); }

    }

    const updatePassword = (e) => {
        e.preventDefault();
        if (newPassword === newPasswordCheck) {
            let data = {
                password: password,
                newPassword: newPassword,
            };

            fetch('/api/changepassword', {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
        else { M.toast({ html: 'New Passwords do not match' }) }
    }

    return (
        <div className='row' >
            {!loggedIn ? <Redirect to='/' /> : null}
            <div className='row profile-info'>
                {user.avatarUrl ?
                    <div className='col s12 m2 avatar-img-div right-align' >
                        <img className='circle responsive-img avatar-image' src={user.avatarUrl}>
                        </img>
                        <a className="modal-trigger avatar-edit-button" href="#editModal">
                            <i className="material-icons black-text">edit</i>
                        </a>
                    </div>
                    : null}

                {editUsername ?
                    <form className="col s12 m10 hide-on-med-and-up">
                        <div className="input-field">
                            <input onChange={e => setNewUserName(e.target.value)}
                                id="username-login-small" className="validate" type="text" />
                            <label htmlFor="username-login-small">New Username</label>
                        </div>
                        <button className='btn' onClick={updateUserName}>Submit</button>
                        <button className='btn' onClick={() => setEditUsername(false)}>Cancle</button>

                    </form>
                    : <h5 className='col s12 m10 center-align hide-on-med-and-up'>{user.username ? user.username : null}
                        <i onClick={() => setEditUsername(true)} className="material-icons black-text">edit</i>
                    </h5>
                }

                {editUsername ?
                    <form className="col s12 m10 hide-on-small-only">
                        <div className="input-field new-username">
                            <input onChange={e => setNewUserName(e.target.value)}
                                id="username-login" className="validate" type="text" />
                            <label htmlFor="username-login">New Username</label>
                        </div>
                        <button className='btn' onClick={updateUserName}>Submit</button>
                        <button className='btn' onClick={() => setEditUsername(false)}>Cancle</button>
                    </form>
                    : <h5 className='col s12 m10 left-align hide-on-small-only'>{user.username ? user.username : null}
                        <i onClick={() => setEditUsername(true)} className="material-icons black-text">edit</i>
                    </h5>
                }
                <a className="modal-trigger avatar-edit-button" href="#change-password-modal">
                    Change Password
                </a>


                <p className='col s4 m10 hide-on-small-only'>Views: {user.views} </p>
                <p className='col s4 m10 hide-on-small-only'>Upvotes: {user.upvotes} </p>
                <p className='col s4 m2 hide-on-small-only'>Sats: {user.sats} </p>

                <p className='col s4 m10 center-align hide-on-med-and-up'>Views: {user.views} </p>
                <p className='col s4 m10 center-align hide-on-med-and-up'>Upvotes: {user.upvotes} </p>
                <p className='col s4 m2 center-align hide-on-med-and-up'>Sats: {user.sats} </p>

                <a className=" withdraw-button col s12 m2 waves-effect waves-light btn modal-trigger"
                    href="#withdrawModal">
                    Withdraw
                    </a>

            </div >

            <div className=''>
                <Uploader addImage={addImage} />
            </div>
            <Masonry
                breakpointCols={
                    {
                        default: 4,
                        1100: 3,
                        700: 2,
                        505: 1
                    }}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column">

                {images ? images.map((image) => {
                    return <div key={image.imageId}>
                        <ImageCard profile={true} deleteImage={openDeleteImage} imageData={image} />
                    </div>
                }) : null}

            </Masonry>


            <div id="editModal" className="modal">
                <div className="modal-content row">
                    <h4 className='center-align'>Choose a new avatar</h4>
                    <AvatarUploader updateAvatar={updateAvatar} />
                </div>
            </div>

            <div id="change-password-modal" className="modal">
                <form className="col s12">

                    <div className="row">
                        <div className="input-field col s12">
                            <input onChange={e => setPassword(e.target.value)}
                                id="password-change" type="password" className="validate" />
                            <label htmlFor="password-change">Old Password</label>
                        </div>

                        <div className="input-field col s12">
                            <input onChange={e => setNewPassword(e.target.value)}
                                id="new-password-change" type="password" className="validate" />
                            <label htmlFor="password-signup">New Password</label>
                        </div>

                        <div className="input-field col s12">
                            <input onChange={e => setNewPasswordCheck(e.target.value)}
                                id="new-password-check-change" type="password" className="validate" />
                            <label htmlFor="new-password-check-change">New Password</label>
                        </div>
                    </div>
                    <button className='btn' onClick={updatePassword}>Submit</button>
                </form>
            </div>

            <div id="withdrawModal" className="modal">
                <div className="modal-content">
                    <h4 className='center-align'>Withdraw</h4>
                </div>
                <div className="input-field">
                    <form className="">
                        <div className="row container">
                            <div className="input-field col m10 s12">
                                <i className="material-icons prefix">mode_edit</i>
                                <textarea id="icon_prefix2" className="materialize-textarea withdraw-textarea" onChange={(e) => {
                                    setInvoice(e.target.value)
                                }}></textarea>
                                <label htmlFor="icon_prefix2">Lightning Invoice</label>
                            </div>
                            <button onClick={withdraw} className='btn col m3 s12  modal-close'>Withdraw</button>
                        </div>
                    </form>
                </div>
            </div>

            <div id="deleteModal" className="modal">
                <div className="modal-content">
                    <h4>Are you sure you want to delete this image?</h4>
                </div>
                <div className="modal-footer">
                    <a href="#!" onClick={() => {
                        deleteImage()
                    }} className="modal-close waves-effect waves-green btn-flat">Confirm</a>
                    <a href="#!" className="modal-close waves-effect waves-green btn-flat">Cancel</a>
                </div>
            </div>
        </div >
    )
}
