import { Button, cn } from "@nextui-org/react";
import React from "react";
import { HiOutlineTrash } from "react-icons/hi";

export default function PreviewFiles({ onRemove, className, filesList }) {
  const filesMapping = Array.from(filesList).map((file) => {
    return (
      <li
        className="relative w-28 h-24 rounded-md overflow-hidden group"
        key={file.name}
      >
        <img
          className="w-full h-full"
          src={URL.createObjectURL(file)}
          alt="previwe file"
        />
        <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30"></span>
        <div className="absolute inset-0 flex flex-col justify-between p-1 opacity-0 group-hover:opacity-100">
          <p className="text-white text-tiny">{file.name}</p>
          <div className="flex items-center justify-between">
            <p className="text-white text-tiny">35mb</p>
            <Button
              isIconOnly
              radius="full"
              size="sm"
              onClick={() => onRemove(file.name)}
            >
              <HiOutlineTrash className="text-lg" />
            </Button>
          </div>
        </div>
      </li>
    );
  });

  return filesMapping.length ? (
    <ul className={cn("flex gap-1.5 mb-2", className)}>{filesMapping}</ul>
  ) : null;
}
