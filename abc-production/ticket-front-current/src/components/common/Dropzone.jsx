import React from "react";
import { HiOutlineCloudUpload } from "react-icons/hi";
import { forwardRef } from "react";

const Dropzone = forwardRef(function (props, ref) {
  const { name, control, ...restProps } = props;
  return (
    <div className="rounded-lg border border-dashed border-primary-500 hover:bg-primary-100 relative w-full mb-3">
      <input
        id="dropzone-file"
        type="file"
        className="cursor-pointer absolute inset-0  opacity-0"
        multiple
        ref={ref}
        {...restProps}
      />
      <div className="flex flex-col box-center py-12">
        <HiOutlineCloudUpload className="w-8 h-8" />
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold">Click to upload</span> or drag and
          drop
        </p>
        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
      </div>
    </div>
  );
});

export default Dropzone;
