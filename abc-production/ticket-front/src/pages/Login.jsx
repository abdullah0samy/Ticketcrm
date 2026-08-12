import React from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Col, Container, Image, Card, Row, Form } from "react-bootstrap";
import { FormInput } from "./../components/elements/Form";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./../store/Slice/userSlice";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ButtonForm from "../components/elements/ButtonForm";
import { t } from "i18next";
import { requestPermission } from "./../utils/requestPermission";
import {
  getBuilding,
  getDepartment,
  getIssuetype,
  getAllIssuetype,
} from "./../store/Slice/hospitalSlice";
import { newSocket } from "../App";

function Login() {
  const dispatch = useDispatch();
  const { isUser } = useSelector((state) => state.user);

  const initialValues = {
    fingerid: "",
    password: "",
  };

  let schema = Yup.object({
    fingerid: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
  });

  const submitForm = async (data) => {
    data.fingerid = +data.fingerid;
    try {
      await dispatch(login(data)).unwrap();
      requestPermission();
      await dispatch(getDepartment()).unwrap();
      dispatch(getBuilding());
      dispatch(getIssuetype());
      dispatch(getAllIssuetype());
      newSocket.connect()
      newSocket.onMessageWebSocket(dispatch)
      return <Navigate to="/tickets/sent/?page=1&size=10" />;
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const { register, handleSubmit, formState } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(schema),
  });

  if (isUser) {
    return <Navigate to="/tickets/sent/?page=1&size=10" />;
  }

  return (
    <div className="vw-100 vh-100 center position-relative">
      <p className="fs-5 text-secondary  position-absolute bottom-0 mb-5">
        Powered by ABC Hospital IT Team
      </p>
      <Container>
        <Row className="center-y justify-content-between">
          <Col lg={5} className="d-none d-lg-block text-center">
            <Image className="w-100" src="/abc 2.jpeg" alt="" />
          </Col>
          <Col lg={6}>
            <Card>
              <Card.Body className="p-4">
                <h5 className="text-capitalize h3 mb-1">{t("welcome back")}</h5>
                <Form className="mt-4" onSubmit={handleSubmit(submitForm)}>
                  <FormInput
                    name="fingerid"
                    register={register("fingerid")}
                    label={t("fingerid")}
                    placeholder={t("fingerid")}
                    required
                    type="text"
                    formState={formState}
                  />
                  <FormInput
                    name="password"
                    register={register("password")}
                    label={t("password")}
                    placeholder={t("password")}
                    type="password"
                    required
                    formState={formState}
                  />
                  <ButtonForm
                    text={t("login")}
                    isSubmitting={formState.isSubmitting}
                  />
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
