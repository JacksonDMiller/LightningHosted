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
        // append new comment
        console.log(comments)

    }

    const commentList = comments.map((comment) =>
        <div key={comment.commentId} className=' row commentBox'>
            <img className='col s1 responsive-img circle' src={comment.avatar} alt="" />
            <h4 className='col s4'>{comment.comenter}</h4>
            <h6 className='col s4'>6/24/2020</h6>
            <p className='col s12'>{comment.comment}</p>
        </div>
    )

    return (
        <div className='container'>
            {commentList}
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


