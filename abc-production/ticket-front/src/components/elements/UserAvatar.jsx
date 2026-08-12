import React from "react";

function UserAvatar({ img, name, subTitle, ...rest }) {
  return (
    <div className="d-flex gap-2 align-items-center" {...rest}>
      <div className="avatar avatar-sm">
        <img className="rounded-circle" src={img} alt="" />
      </div>
      <div>
        <p className="mb-0 fs-text lh-1 text-capitalize">{name}</p>
        <small className="mb-0 lh-1">{subTitle}</small>
      </div>
    </div>
  );
}

export default UserAvatar;
