import { Button } from "@nextui-org/react";
import { t } from "i18next";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { updateTicket } from "../../redux/actions/ticketActions";
import { toast } from "sonner";
import useGetOptions from "./../../hooks/useGetOptions";
import SelectRHF from "../RHF/SelectRHF";
import Dialog from "./../common/Dialog";
import SwitchRHF from "../RHF/SwitchRHF";
import InputRHF from "../RHF/InputRHF";

function IssueTypeModal({ ticketId, isOpen, onClose }) {
  const dispatch = useDispatch();
  const { handleSubmit, reset, control, formState, watch } = useForm({
    defaultValues: {
      issuetype: "",
      is_external: false,
      note: "",
    },
  });

  const isExternal = watch("is_external"); // Watch the is_external field

  const onSubmit = async (data) => {
    const payload = { ticketId, data };
    try {
      await dispatch(updateTicket(payload)).unwrap();
      toast.success(t("the complaint has been successfully resolved"));
      reset();
      onClose();
    } catch (error) {
      toast.error(error);
    }
  };

  const { getOptions, options, isLoading } = useGetOptions(
    "ticket/router/issuetypes/select/?me=true"
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
        {t("determine issue type")}
      </Dialog.Header>
      <Dialog.Body>
        <form onSubmit={handleSubmit(onSubmit)} id="form">
          <SelectRHF
            name="issuetype"
            label={t("issuetype")}
            control={control}
            isLoading={isLoading}
            options={options}
            onMenuOpen={getOptions}
          />
          <SwitchRHF
            label={t("Resolved by external resource")}
            className="z-0 mb-3"
            name="is_external"
            control={control}
          />
          {isExternal && (
            <InputRHF
              name="note"
              type="textarea"
              label={t("note")}
              control={control}
              required
            />
          )}
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

export default IssueTypeModal;
