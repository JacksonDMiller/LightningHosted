$(document).ready(function () {
    var id = $("#shareImage").find('.chevron').attr('id')
    if (upVoted[id] === true) {
        $("#shareImage").find('.chevron').addClass("upVoted")
    }
});

function submitComment(id, commentId, subId) {
    var commentText = $(':focus').siblings('.replyBox').val();
    var encodedCommentText = encodeURIComponent(commentText)
    $.get("../noauth/comment/" + id + "/" + commentId + "/" + encodedCommentText + '/', function (data, status) {
        if (commentId == undefined) {
            comment = $('.commentStringTemplate').clone()
            comment.removeClass('commentStringTemplate')
            comment.find('p').text(commentText)
            $('#comments').append(comment)
            comment.find('.replyBtn').attr('onclick', 'reply("' + id + '","' + data + '")')
            comment.attr('id', data)
            comment.toggle()
            $(':focus').siblings('.replyBox').val('');
        }
        else {
            subComment = $('.subCommentTemplate').clone()
            subComment.removeClass('subCommentTemplate')
            subComment.attr('id',data)
            subComment.find('p').text(commentText)
            $('#' + commentId).append(subComment)
            subComment.toggle()
            $('#' + commentId).find('.replyBoxContainer').remove()
            subComment.find('.replyBtn').attr('onclick', 'reply("' + id + '","' + commentId + '","' + data + '")')
            if (subId) {
                $('#' + subId).children(".replyBtn").toggle();
            }
            else {
                $('#' + commentId).find(".topLevelComment").children(".replyBtn").toggle();
            }
        }



    });
}

function reply(imageId, commentId, subId) {
    newCommentBox = $('.replyBoxContainertemplate').clone()
    if (subId == undefined) {
        newCommentBox.find('.submitBtn').attr('onclick', 'submitComment("' + imageId + '","' + commentId + '")')
        $('#' + commentId).find(".topLevelComment").append(newCommentBox);
        $('#' + commentId).find(".topLevelComment").children(".replyBtn").toggle();
    }
    else {
        newCommentBox.find('.submitBtn').attr('onclick', 'submitComment("' + imageId + '","' + commentId + '","' + subId + '")')
        $('#' + subId).append(newCommentBox)
        $('#' + subId).children(".replyBtn").toggle();
    }
    newCommentBox.toggle();
    newCommentBox.removeClass('replyBoxContainertemplate')
}