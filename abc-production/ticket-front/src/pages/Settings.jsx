import React from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, Col, Row, Form } from "react-bootstrap";
import { FormInput } from "./../components/elements/Form";
import { useForm } from "react-hook-form";
import { changePassword } from "../store/Slice/userSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ButtonForm from "../components/elements/ButtonForm";
import { t } from "i18next";

function Settings() {
  const dispatch = useDispatch();

  let schema = Yup.object({
    old_password: Yup.string().required("Required"),
    new_password: Yup.string().required("Required"),
    confirm_new_password: Yup.string().required("Required"),
  });

  const { register, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(schema),
  });

  const submitForm = async (data) => {
    try {
      if (data.new_password !== data.confirm_new_password) {
        toast.warn(t("password confirmation"), {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        const res = await dispatch(changePassword(data)).unwrap();
        reset();
        toast.success(res.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return (
    <Row className="center">
      <Col md={10}>
        <Card className="mt-4 shadow-sm rounded-2 p-4">
          <h4 className="h3 mb-0 text-capitalize">{t("settings acount")}</h4>
          <Form className="mt-4" onSubmit={handleSubmit(submitForm)}>
            <FormInput
              name="old_password"
              register={register("old_password")}
              label={t("old password")}
              placeholder={t("old password")}
              type="password"
              formState={formState}
            />
            <FormInput
              name="new_password"
              register={register("new_password")}
              label={t("new password")}
              placeholder={t("new password")}
              type="password"
              formState={formState}
            />
            <FormInput
              name="confirm_new_password"
              register={register("confirm_new_password")}
              label={t("confirm password")}
              placeholder={t("confirm password")}
              type="password"
              formState={formState}
            />
            <ButtonForm
              text={t("update")}
              isSubmitting={formState.isSubmitting}
            />
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export default Settings;
