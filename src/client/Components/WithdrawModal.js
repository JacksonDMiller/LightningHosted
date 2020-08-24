import React, { useState } from 'react'

export default function WithdrawModal() {

    const [invoice, setInvoice] = useState(null)

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
    return (
        <span>
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
        </span>
    )
}
