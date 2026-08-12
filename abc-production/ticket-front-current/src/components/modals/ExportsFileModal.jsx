import React from "react";
import { Button } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import InputRHF from "../RHF/InputRHF";
import { chunks_options } from "../../utils/selectOptions";
import { t } from "i18next";
import Dialog from "../common/Dialog";
import RangeDatePickerRHF from "../RHF/RangeDatePickerRHF";
import { useDispatch } from "react-redux";
import { exportTickets } from "../../redux/actions/exportActions";
import { toast } from "sonner";
import moment from "moment";
import SelectRHF from "../RHF/SelectRHF";

function ExportsFileModal({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const { handleSubmit, reset, control, formState } = useForm({
    defaultValues: {
      filename: "",
      chunk: "1",
      date: [],
    },
  });

  const onSubmit = async (values) => {
    try {
      const startDate = moment(values.date[0]).format("DD-MM-YYYY");
      const endDate = moment(values.date[1]).format("DD-MM-YYYY");
      values.created_at = `${startDate} ${endDate}`;
      await dispatch(exportTickets(values)).unwrap();
      reset();
      onClose();
    } catch (error) {
      toast.error(error);
    }
  };
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Dialog.Header className="capitalize">
        {t("exports excel file")}
      </Dialog.Header>
      <Dialog.Body>
        <form onSubmit={handleSubmit(onSubmit)} id="form">
          <InputRHF
            name="filename"
            label={t("file name")}
            placeholder={t("enter file name")}
            control={control}
          />
          <SelectRHF
            name="chunk"
            label={t("chunk")}
            placeholder={t("select chunk")}
            control={control}
            options={chunks_options}
          />
          <RangeDatePickerRHF
            name="date"
            label={t("date")}
            placeholderText={t("select date")}
            control={control}
            maxDate={new Date()}
          />
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <Button color="danger" variant="light" onClick={onClose}>
          {t("close")}
        </Button>
        <Button
          type="submit"
          color="primary"
          form="form"
          isLoading={formState.isSubmitting}
        >
          {t("submit")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
export default ExportsFileModal;
