import moment from "moment";
import React from "react";

function Message({ commentData, is_mine }) {
  const { comment, commenter, created_at } = commentData;

  if (is_mine) {
    return (
      <div className={`message message_sent mb-2`}>
        <div className="message-content">
          <p className="mb-0">{comment}</p>
        </div>
        <small className="mb-0">{moment(created_at).format("l LT")}</small>
      </div>
    );
  } else {
    return (
      <>
        <div className="message message_received mb-2">
          <small className="mb-1">{commenter.name}</small>
          <div className="message-content">
            <p className="mb-0">{comment}</p>
          </div>
          <small className="mb-0">{moment(created_at).format("l LT")}</small>
        </div>
      </>
    );
  }
}

export default Message;
