import React from "react";
import { Form, Modal, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormSelect } from "../elements/Form";
import { patchTicket, updateTicket } from "../../store/Slice/ticketSlice";
import { toast } from "react-toastify";
import ButtonForm from "../elements/ButtonForm";
import { getIssuetype } from "../../store/Slice/hospitalSlice";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

function IssueTypeModal({ ticketId, show, onHide }) {
  const dispatch = useDispatch();
  const { issuetype } = useSelector((state) => state.hospital);
  const { department } = useSelector((state) => state.user.userData);
  const { i18n } = useTranslation();

  let schema = Yup.object({
    issuetype: Yup.string().required("Required"),
  });

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
  });

  const submitForm = async (data) => {
    data.issuetype = +data.issuetype;
    data.ticketId = ticketId;
    try {
      const res = await dispatch(patchTicket(data)).unwrap();
      console.log(res);
      dispatch(updateTicket(res));
      onHide();
      toast.success(t("issue type success"), {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handelIssuetype = () => {
    if (issuetype.length === 0) {
      dispatch(getIssuetype(department.id));
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          {t("determine issue type")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="comments-body">
        <Form onSubmit={handleSubmit(submitForm)} id="issue-type">
          <FormSelect
            name="issuetype"
            label={t("issus type")}
            register={register("issuetype")}
            required
            formState={formState}
            onClick={() => handelIssuetype()}
          >
            <option value="">{t("select issue type")}</option>
            {issuetype.map(({ name, id }) => {
              return (
                <option value={id} key={id}>
                  {name}
                </option>
              );
            })}
          </FormSelect>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-block">
        <ButtonForm
          text={t("save")}
          form="issue-type"
          isSubmitting={formState.isSubmitting}
        />
        <Button variant="danger" className="ms-2" onClick={onHide}>
          {t("close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default IssueTypeModal;
