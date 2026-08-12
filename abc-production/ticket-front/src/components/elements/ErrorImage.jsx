import React from "react";
import { Image } from "react-bootstrap";

function ErrorImage({ image, text, full }) {
  return (
    <div className="py-4 center text-center">
      <div className={`${full ? "col-12" : "col-md-6 "} text-center`}>
        <Image className="w-100" src={image} />
        <h3 className="fs-2 mt-3">{text}</h3>
      </div>
    </div>
  );
}

export default ErrorImage;
