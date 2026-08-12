/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Card, Form } from "react-bootstrap";
import { Camera } from "../Icons";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { createNote } from "../../store/Slice/noteSlice";
import ButtonForm from "./../elements/ButtonForm";
import { t } from "i18next";

function AddPostCard({ userImg }) {
  const dispatch = useDispatch();
  const [image, setImage] = useState([]);

  let schema = Yup.object({
    note: Yup.string().required("Required"),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const submitForm = async (data) => {
    const formData = new FormData();
    formData.append("note", data.note);
    for (const key of Object.keys(data.image)) {
      if (key < 3) {
        formData.append("media", data.image[key]);
      }
    }
    try {
      await dispatch(createNote(formData)).unwrap();
      reset();
      setImage([]);
      toast.success(t("add note success"), {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const watchImage = watch("image");
  useEffect(() => {
    if (watch("image").length > 0) {
      const arrayImages = Object.values(watchImage);
      setImage(arrayImages.slice(0, 3));
    }
  }, [watchImage]);

  return (
    <Card className="note_post mt-4 mb-5">
      <Form onSubmit={handleSubmit(submitForm)}>
        <Card.Body>
          <div className="d-flex gap-2 mb-2">
            <div className="avatar avatar-sm">
              <img src={userImg} alt="avatar user" />
            </div>
            <Form.Control
              {...register("note")}
              as="textarea"
              placeholder={t("placeholder note")}
              isInvalid={errors.note && isSubmitted}
              isValid={!errors.note && isSubmitted}
            />
          </div>
          <div className="ps-5">
            {image.length > 0 && (
              <h6 className="h5 mb-0 mb-2">Pictures and picks</h6>
            )}
            {image.map((img, idx) => {
              return (
                <img
                  className="me-2 mb-2 shadow-sm"
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt={img.name}
                  style={{ width: "100px", height: "100px" }}
                />
              );
            })}
          </div>
        </Card.Body>
        <Card.Footer className="bg-white d-flex align-items-center justify-content-between">
          <ButtonForm text={t("add note")} isSubmitting={isSubmitting} />
          <div className="upload upload-img upload-md">
            <input
              type="file"
              name="image"
              {...register("image")}
              multiple
              accept=".png,.jpg,jpeg"
            />
            <Camera width="28px" />
          </div>
        </Card.Footer>
      </Form>
    </Card>
  );
}

export default AddPostCard;
