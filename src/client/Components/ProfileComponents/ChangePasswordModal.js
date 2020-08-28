import React, { useState } from 'react'

export default function ChangePasswordModal() {
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newPasswordCheck, setNewPasswordCheck] = useState('')

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
                    if (data.error) {
                        M.toast({ html: data.error })
                    }
                    else {
                        M.toast({ html: 'Password Changed' })
                        setPassword('');
                        setNewPassword('');
                        setNewPasswordCheck('');
                        let passwordChangeModal = document.querySelectorAll('#change-password-modal')
                        M.Modal.getInstance(passwordChangeModal[0]).close();
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
        else { M.toast({ html: 'New Passwords do not match' }) }
    }

    return (
        <form className="col s12">
            <div className="row">
                <div className="input-field col s12">
                    <input onChange={e => setPassword(e.target.value)} value={password}
                        id="password-change" type="password" className="validate" />
                    <label htmlFor="password-change">Old Password</label>
                </div>

                <div className="input-field col s12">
                    <input onChange={e => setNewPassword(e.target.value)}
                        value={newPassword} id="new-password-change" type="password" className="validate" />
                    <label htmlFor="new-password-change">New Password</label>
                </div>

                <div className="input-field col s12">
                    <input onChange={e => setNewPasswordCheck(e.target.value)}
                        value={newPasswordCheck} id="new-password-check-change" type="password" className="validate" />
                    <label htmlFor="new-password-check-change">New Password</label>
                </div>
            </div>
            <button className='btn' onClick={updatePassword}>Submit</button>
        </form>
    )
}
