import React, { useState, useContext } from 'react';
import { store } from '../Context/Store';

export default function CommentSection(props) {
    const [newComment, setnewComment] = useState('')
    const [comments, setComments] = useState(props.comments)
    const globalState = useContext(store);

    const submitComment = async (e) => {
        e.preventDefault();
        if (globalState.state.auth === false) {
            M.toast({ html: "<a href='/login'>Please Login First</a>" })
        }
        else {


            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageId: props.imageId,
                    comment: newComment
                })
            };
            let res = await (await fetch('/api/newcomment/', requestOptions)).json();
            if (res.error) {
                M.toast({ html: res.error })
            }
            else {
                setComments([res.newComment, ...comments]);
                setnewComment('');
                props.incrementComments();
            }
        }
    }

    const commentList = comments.map((comment) =>
        <div key={comment.commentId} className=' row comment-box'>
            <img className='col s2 l1 responsive-img circle' src={comment.avatar} alt="" />
            <h6 className='col s5 l5'>{comment.comenter}</h6>
            <h6 className='col s5 l6'>{timeAgo(comment.date)}</h6>
            <p className='col s10 offset-s2'>{comment.comment}</p>
            {globalState.state.moderator
                ? <button onClick={() => fetch('/api/moderatorsuppresscomment/' + comment.commentId + '/' + props.imageId)} className="btn">Delete</button>
                : null
            }
        </div>
    )


    function getFormattedDate(date, prefomattedDate = false, hideYear = false) {
        const MONTH_NAMES = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const day = date.getDate();
        const month = MONTH_NAMES[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours();
        let minutes = date.getMinutes();

        if (minutes < 10) {
            // Adding leading zero to minutes
            minutes = `0${minutes}`;
        }

        if (prefomattedDate) {
            // Today at 10:20
            // Yesterday at 10:20
            return `${prefomattedDate} at ${hours}:${minutes}`;
        }

        if (hideYear) {
            // 10. January at 10:20
            return `${day}. ${month} at ${hours}:${minutes}`;
        }

        // 10. January 2017. at 10:20
        return `${day}. ${month} ${year}. at ${hours}:${minutes}`;
    }


    // --- Main function
    function timeAgo(dateParam) {
        if (!dateParam) {
            return null;
        }

        const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
        const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
        const today = new Date();
        const yesterday = new Date(today - DAY_IN_MS);
        const seconds = Math.round((today - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const isToday = today.toDateString() === date.toDateString();
        const isYesterday = yesterday.toDateString() === date.toDateString();
        const isThisYear = today.getFullYear() === date.getFullYear();


        if (seconds < 5) {
            return 'just now';
        } else if (seconds < 60) {
            return `${seconds} seconds ago`;
        } else if (seconds < 90) {
            return 'about a minute ago';
        } else if (minutes < 60) {
            return `${minutes} minutes ago`;
        } else if (isToday) {
            return getFormattedDate(date, 'Today'); // Today at 10:20
        } else if (isYesterday) {
            return getFormattedDate(date, 'Yesterday'); // Yesterday at 10:20
        } else if (isThisYear) {
            return getFormattedDate(date, false, true); // 10. January at 10:20
        }

        return getFormattedDate(date); // 10. January 2017. at 10:20
    }

    return (
        <div className='container'>
            <div className="row">
                <form className="col s12">
                    <div className="row">
                        <div className="input-field col s11">
                            <i className="material-icons prefix">mode_edit</i>
                            <textarea id="icon_prefix2" className="materialize-textarea" onChange={
                                e => setnewComment(e.target.value)} value={newComment}>
                            </textarea>
                            <label htmlFor="icon_prefix2">Write Your Comment</label>
                        </div>
                        <button onClick={submitComment}
                            className="btn waves-effect waves-light col s4 offset-s8 m3 offset-m9 l2 offset-l10 " type="submit" name="action">
                            Submit
                            <i className="material-icons right">send</i>
                        </button>
                    </div>
                </form>
            </div>
            {commentList}

        </div>
    )
}


