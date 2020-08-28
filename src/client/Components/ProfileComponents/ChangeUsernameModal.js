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
            let changeUserNameModal = document.querySelectorAll('#change-username-modal')
            M.Modal.getInstance(changeUserNameModal[0]).close();
            M.toast({ html: 'Username Changed' })
        }
        else { M.toast({ html: result.error }); }

    }
    return (
        <span>
            < form className="col s12 m10">
                <ol>
                    <li>Must be 3-16 characters long</li>
                    <li>No spaces</li>
                    <li>You may use A-Z 0-9 and _ </li>
                </ol>
                <div className="input-field">
                    <input onChange={e => setNewUserName(e.target.value)}
                        id="username-login-small" className="validate" type="text" />
                    <label htmlFor="username-login-small">New Username</label>
                </div>
                <button className='btn' onClick={updateUserName}>Submit</button>
            </form>

        </span >
    )
}
