import { Button } from "@nextui-org/react";
import { t } from "i18next";
import React from "react";
import SelectRHF from "../RHF/SelectRHF";
import { useForm } from "react-hook-form";
import RadioGroupRHF from "../RHF/RadioGroupRHF";
import useGetOptions from "./../../hooks/useGetOptions";
import Dialog from "./../common/Dialog";
import { useDispatch } from "react-redux";
import { transferTickets } from "../../redux/actions/ticketActions";
import { toast } from "sonner";
import { Radio } from "../ui/RadioGroup";

function TransferModal({ ticketIds, isOpen, onClose }) {
  const dispatch = useDispatch();

  const { handleSubmit, reset, control } = useForm({
    defaultValues: {
      department: "",
      option: true,
      ticket: ticketIds,
    },
  });

  const onSubmit = async (values) => {
    console.log(values);
    try {
      values.option = !values.option;
      await dispatch(transferTickets(values)).unwrap();
      toast.success(t("transfer completed successfully"));
      reset();
      onClose();
    } catch (error) {
      toast.error(error);
    }
  };

  const { getOptions, options, isLoading } = useGetOptions(
    "/users/router/department/select/?reciever=true"
  );
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      classNames={{ body: "overflow-auto" }}
      scrollBehavior="inside"
      size="lg"
    >
      <Dialog.Header className="capitalize">
        {t("transfer to department")}
      </Dialog.Header>
      <Dialog.Body>
        <form onSubmit={handleSubmit(onSubmit)} id="form">
          <SelectRHF
            name="department"
            label={t("department")}
            placeholderText={t("select department")}
            control={control}
            isLoading={isLoading}
            options={options}
            onMenuOpen={getOptions}
          />
          <RadioGroupRHF name="option" label={t("option")} control={control}>
            <Radio value={"true"}>{t("same stage")}</Radio>
            <Radio value={"false"}>{t("delete records")}</Radio>
          </RadioGroupRHF>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <Button color="danger" variant="light" onClick={onClose}>
          {t("close")}
        </Button>
        <Button type="submit" color="primary" form="form">
          {t("submit")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export default TransferModal;
