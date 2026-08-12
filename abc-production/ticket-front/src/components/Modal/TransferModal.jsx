import React from "react";
import { useSelector, useDispatch } from "react-redux";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormSelect } from "../elements/Form";
import { Form, Modal, Button } from "react-bootstrap";
import { getDepartment } from "../../store/Slice/hospitalSlice";
import { transferTicket } from "../../store/Slice/ticketSlice";
import { toast } from "react-toastify";
import ButtonForm from "../elements/ButtonForm";
import { t } from "i18next";
import { closeTransfer } from "../../store/Slice/transferSlice";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

function TransferModal() {
  const { department } = useSelector((state) => state.hospital);
  const { ticketId, showTransfer } = useSelector((state) => state.transfer);
  const { i18n } = useTranslation();

  const dispatch = useDispatch();

  let schema = Yup.object({
    department: Yup.string().required("Required"),
    option: Yup.string().required("Required"),
  });

  const { register, handleSubmit, resetField, formState } = useForm({
    resolver: yupResolver(schema),
  });

  const submitForm = async (data) => {
    data.ticket = ticketId;
    data.department = +data.department;
    data.option = !!data.department;
    try {
      const res = await Swal.fire({
        title: t("swal title"),
        showCancelButton: true,
        icon: "info",
        confirmButtonText: t("yes"),
        cancelButtonText: t("cancel"),
        confirmButtonColor: "#198754",
        cancelButtonColor: "#dc3545",
      });
      if (res.isConfirmed) {
        await dispatch(transferTicket(data)).unwrap();
        dispatch(closeTransfer());
        resetField("department");
        toast.success(t("transfer ticket success"), {
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
    <Modal
      show={showTransfer}
      onHide={() => dispatch(closeTransfer())}
      size="lg"
      centered
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <Modal.Header>
        <Modal.Title>{t("transfer to department")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(submitForm)} id="transfer-ticket">
          <FormSelect
            name="department"
            label={t("department")}
            register={register("department")}
            required
            formState={formState}
            onClick={() => dispatch(getDepartment())}
          >
            <option value="">{t("select department")}</option>
            {department.map(({ name, id }) => {
              return (
                <option value={id} key={id}>
                  {name}
                </option>
              );
            })}
          </FormSelect>
          <Form.Check
            type="radio"
            {...register("option")}
            label={t("same stage")}
            value={true}
            id={`option-1`}
            reverse={i18n.language === "ar" ? true : null}
          />
          <Form.Check
            type="radio"
            {...register("option")}
            label={t("delete records")}
            value={false}
            id={`option-2`}
            reverse={i18n.language === "ar" ? true : null}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <ButtonForm
          text={t("save")}
          isSubmitting={formState.isSubmitting}
          form="transfer-ticket"
        />

        <Button variant="danger" onClick={() => dispatch(closeTransfer())}>
          {t("close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TransferModal;
