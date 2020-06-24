import React, { useState } from 'react';

export default function CommentSection({ comments, imageId }) {

    const [newComment, setnewComment] = useState('')
    const submitComment = async (e) => {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageId: imageId,
                comment: newComment
            })
        };

        const response = await fetch('/api/newcomment/', requestOptions);
        const data = await response.json();
        // append new comment

    }
    return (
        <div className=' container row commentBox'>
            <img className='col s1 responsive-img circle' src="https://lh6.googleusercontent.com/-YRTDUuiWUnk/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckZSwRpas6CtGq74_AF-MwQW3mu2g/photo.jpg" alt="" />
            <h4 className='col s4'>Jackson Miller</h4>
            <h6 className='col s4'>6/24/2020</h6>
            <p className='col s12'>Lorem ipsum has been ubiquitous in publishing and graphic design — either physical or digital — since as far back as the 16th century. Recently, it’s also become common to create variations on the “classic” lorem ipsum that feature words or quotes from various sources in an effort to inject some variety into dummy text.  </p>

            <div className="row">
                <form className="col s12">
                    <div className="row">
                        <div className="input-field col s10">
                            <i className="material-icons prefix">mode_edit</i>
                            <textarea id="icon_prefix2" className="materialize-textarea" onChange={e => setnewComment(e.target.value)} value={newComment}></textarea>
                            <label htmlFor="icon_prefix2">Write Your Comment</label>
                        </div>
                        <button onClick={submitComment} className="btn waves-effect waves-light col s2" type="submit" name="action">Submit
    <i className="material-icons right">send</i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


