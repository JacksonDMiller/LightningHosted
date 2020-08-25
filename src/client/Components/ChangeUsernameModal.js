import React, { useState } from 'react'

export default function EditUsernameInput({ user, setUser }) {
    const [newUserName, setNewUserName] = useState(null)

    const updateUserName = async (e) => {
        e.preventDefault();

        let data = {
            username: newUserName,
        };

        const res = await fetch('/api/changeusername/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        const result = await res.json();
        if (res.status === 200) {
            setUser({ ...user, username: newUserName });
            setEditUsername(false);
        }
        else { M.toast({ html: result.error }); }

    }
    return (
        <span>
            < form className="col s12 m10">
                <div className="input-field">
                    <input onChange={e => setNewUserName(e.target.value)}
                        id="username-login-small" className="validate" type="text" />
                    <label htmlFor="username-login-small">New Username</label>
                </div>
                <button className='btn' onClick={updateUserName}>Submit</button>
                <button className='btn' onClick={() => setEditUsername(false)}>Cancle</button>
            </form>

        </span >
    )
}
