import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateUser } from "../../store/Slice/userSlice";
import { Camera } from "../Icons";
import { t } from "i18next";

function User() {
  const {
    userData: { first_name, last_name, image, department },
  } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const changeImage = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    const res =  dispatch(updateUser(formData)).unwrap();
    toast.promise(res, {
      pending: t("upload pending"),
      success: t("upload success"),
      error: t("upload error"),
    });
  };

  return (
    <div className="user mt-3 d-flex flex-column align-items-center">
      <div className="avatar avatar-lg mb-2 position-relative">
        <img src={image} alt="" />
        <div className="upload upload-img upload-sm position-absolute bottom-0 end-0">
          <input
            type="file"
            name="image"
            onChange={changeImage}
            multiple
            accept=".png,.jpg,jpeg"
          />
          <Camera width="22px" />
        </div>
      </div>
      <h5 className="fs-5 text-capitalize text-center mb-0">{`${first_name} ${last_name}`}</h5>
      <p className="fs-text mb-0">{t(department.name)}</p>
    </div>
  );
}

export default User;
