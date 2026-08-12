/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Card, Col, Row, Form } from "react-bootstrap";
import { FormInput, FormSelect } from "./../components/elements/Form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  clearFloor,
  getBuilding,
  getDepartment,
  getFloor,
} from "./../store/Slice/hospitalSlice";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { countryPhone } from "../data/country";
import { createTicket } from "../store/Slice/ticketSlice";
import { toast } from "react-toastify";
import ButtonForm from "../components/elements/ButtonForm";
import { Upload } from "../components/Icons";
import Select from "react-select";

function AddTicket() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { department, building, floor } = useSelector(
    (state) => state.hospital
  );
  const [code, setCode] = useState("+20");
  const [image, setImage] = useState([]);
  let schema = Yup.object().shape(
    {
      department: Yup.string().required("Required"),
      building: Yup.string().required("Required"),
      floor: Yup.string().required("Required"),
      extension: Yup.number().min(1000).max(9999).required("Required"),
      Description: Yup.string().required("Required"),
      phone: Yup.string()
        .nullable()
        .notRequired()
        .when("phone", {
          is: (value) => value,
          then: (rule) => rule.min(8).max(15),
        }),
    },
    [["phone", "phone"]]
  );

  const { register, handleSubmit, watch, reset, resetField, formState } =
    useForm({
      resolver: yupResolver(schema),
    });

  const submitForm = async (data) => {
    const phone = data.phone ? `${code}${data.phone}` : "";
    const formData = new FormData();
    formData.append("department", +data.department);
    formData.append("building", data.building);
    formData.append("floor", data.floor);
    formData.append("extension", +data.extension);
    formData.append("phone", phone);
    formData.append("Description", data.Description);
    for (const key of Object.keys(data.image)) {
      if (key < 3) {
        formData.append("image", data.image[key]);
      }
    }
    try {
      await dispatch(createTicket(formData)).unwrap();
      reset();
      setImage([]);
      toast.success(t("add ticket success"), {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  const watchBuilding = watch("building");
  const watchImage = watch("image");
  useEffect(() => {
    if (watchBuilding) {
      dispatch(getFloor(watchBuilding));
    } else {
      resetField("floor");
      dispatch(clearFloor());
    }
  }, [dispatch, resetField, watchBuilding]);

  useEffect(() => {
    if (watch("image").length > 0) {
      const arrayImages = Object.values(watchImage);
      setImage(arrayImages.slice(0, 3));
    }
  }, [watchImage]);

  const handelDepartment = () => {
    if (department.length === 0) {
      dispatch(getDepartment());
    }
  };

  const handelBuilding = () => {
    if (building.length === 0) {
      dispatch(getBuilding());
    }
  };

  return (
    <Row className="center">
      <Col md={10}>
        <Card className="mt-4 shadow-sm rounded-2 py-4 px-3 px-md-4">
          <h4 className="h3 mb-0 text-capitalize">{t("add_new_ticket")}</h4>
          <Form className="mt-4" onSubmit={handleSubmit(submitForm)}>
            <Row>
              <Col sm={6}>
                <FormSelect
                  name="department"
                  label={t("department")}
                  register={register("department")}
                  required
                  formState={formState}
                  onClick={handelDepartment}
                >
                  <option value="">{t("select department")}</option>
                  {department.map(({ name, id }) => {
                    return (
                      <option value={id} key={id}>
                        {t(name)}
                      </option>
                    );
                  })}
                </FormSelect>
              </Col>
              <Col sm={6}>
                <FormSelect
                  name="building"
                  label={t("building")}
                  register={register("building")}
                  required
                  formState={formState}
                  onClick={handelBuilding}
                >
                  <option value="">{t("select building")}</option>
                  {building.map((item) => (
                    <option value={item} key={item}>
                      {t(item)}
                    </option>
                  ))}
                </FormSelect>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormSelect
                  name="floor"
                  label={t("floor")}
                  register={register("floor")}
                  required
                  formState={formState}
                  disabled={floor.length === 0}
                >
                  <option value="">{t("select floor")}</option>
                  {floor.map((item) => (
                    <option value={item} key={item}>
                      {t(item)}
                    </option>
                  ))}
                </FormSelect>
              </Col>
              <Col sm={6}>
                <FormInput
                  name="extension"
                  register={register("extension")}
                  label={t("extension")}
                  placeholder={t("extension")}
                  required
                  type="text"
                  formState={formState}
                />
              </Col>
            </Row>
            <FormInput
              name="Description"
              label={t("Description")}
              placeholder={t("Description")}
              register={register("Description")}
              className="resize-none"
              required
              type="text"
              as="textarea"
              formState={formState}
            />
            <Form.Label>{t("phone")}</Form.Label>
            <div className="mb-3 d-flex gap-2">
              <Select
                className="country-code"
                classNamePrefix="select"
                defaultValue={countryPhone[0]}
                isSearchable={true}
                name="code"
                onChange={(e) => setCode(e.value)}
                options={countryPhone}
              />
              <Form.Control
                {...register("phone")}
                placeholder={t("phone")}
                isInvalid={formState.errors.phone && formState.isSubmitted}
                isValid={!formState.errors.phone && formState.isSubmitted}
              />
            </div>

            <div className="mb-3">
              <Form.Label>{t("image")}</Form.Label>
              <div className="upload upload-drop mb-3">
                <div className="text-center">
                  <Upload />
                  <p className="fs-5">Drag & drop or browse</p>
                </div>
                <input
                  type="file"
                  multiple
                  name="image"
                  {...register("image")}
                />
              </div>
              {image.length > 0 && (
                <h6 className="h5  mb-2">Pictures and picks</h6>
              )}
              {image.map((img, idx) => {
                return (
                  <img
                    className="me-2 shadow-sm"
                    key={idx}
                    src={URL.createObjectURL(img)}
                    alt={img.name}
                    style={{ width: "100px", height: "100px" }}
                  />
                );
              })}
            </div>
            <ButtonForm
              text={t("add ticket")}
              isSubmitting={formState.isSubmitting}
            />
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
export default AddTicket;
