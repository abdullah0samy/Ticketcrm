import React from "react";

function ErrorImage({ image, text, full, children }) {
  return (
    <div className="py-4 box-center text-center">
      <div className={`${full ? "w-full" : "md:w-8/12 "}`}>
        <img className="w-full " src={image} alt="error" />
        <h3 className="text-h4 my-3">{text}</h3>
        {children}
      </div>
    </div>
  );
}

export default ErrorImage;
