import React from "react";

/**
 * Illustration + message, used for genuine error states.
 *
 * The image is capped rather than `w-full`: at 8/12 of a desktop container the
 * artwork rendered close to 900px tall and swamped the page it was supposed to
 * be explaining.
 */
function ErrorImage({ image, text, full, children }) {
  return (
    <div className="py-10 box-center text-center">
      <div className={full ? "w-full" : "max-w-md w-full"}>
        <img
          className="w-full max-w-[240px] mx-auto opacity-90"
          src={image}
          alt=""
        />
        <h3 className="text-base font-medium mt-4 mb-1">{text}</h3>
        {children}
      </div>
    </div>
  );
}

export default ErrorImage;
