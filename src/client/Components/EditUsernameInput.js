import React, { useState } from 'react'

export default function EditUsernameInput({ user, setUser }) {
    const [newUserName, setNewUserName] = useState(null)
    const [editUsername, setEditUsername] = useState(false)


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
    return (
        <span>
            {editUsername
                ? < form className="col s12 m10 hide-on-med-and-up">
                    <div className="input-field">
                        <input onChange={e => setNewUserName(e.target.value)}
                            id="username-login-small" className="validate" type="text" />
                        <label htmlFor="username-login-small">New Username</label>
                    </div>
                    <button className='btn' onClick={updateUserName}>Submit</button>
                    <button className='btn' onClick={() => setEditUsername(false)}>Cancle</button>
                </form>

                : <h5 className='col s12 m10 center-align hide-on-med-and-up'>{user.username}
                    <i onClick={() => setEditUsername(true)} className="material-icons black-text">edit</i>
                </h5>
            }

            {editUsername
                ? <form className="col s12 m10 hide-on-small-only">
                    <div className="input-field new-username">
                        <input onChange={e => setNewUserName(e.target.value)}
                            id="username-login" className="validate" type="text" />
                        <label htmlFor="username-login">New Username</label>
                    </div>
                    <button className='btn' onClick={updateUserName}>Submit</button>
                    <button className='btn' onClick={() => setEditUsername(false)}>Cancle</button>
                </form>
                : <h5 className='col s12 m10 left-align hide-on-small-only'>{user.username}
                    <i onClick={() => setEditUsername(true)} className="material-icons black-text">edit</i>
                </h5>
            }
        </span >
    )
}
