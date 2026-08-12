import React, { useEffect } from "react";
import { Button, Card } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import InputRHF from "../../components/RHF/InputRHF";
import useLocationOptions from "../../hooks/useLocationOptions";
import DropzoneRHF from "../../components/RHF/DropzoneRHF";
import PreviewFiles from "../../components/common/PreviewFiles";
import { toast } from "sonner";
import { t } from "i18next";
import { createTicket } from "../../redux/actions/ticketActions";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { add_ticket_schema } from "../../utils/validationSchema";
import useGetOptions from "../../hooks/useGetOptions";
import SelectRHF from "../../components/RHF/SelectRHF";

export default function AddTicket() {
  const dispatch = useDispatch();
  const defaultValues = {
    department: "",
    building: "",
    floor: "",
    extension: "",
    description : "",
    phone: "",
    image: [],
  };

  const {
    handleSubmit,
    control,
    watch,
    reset,
    resetField,
    setValue,
    formState,
  } = useForm({
    defaultValues,
    resolver: yupResolver(add_ticket_schema),
  });

  const onSubmit = async (values) => {
    try {
      await dispatch(createTicket(values)).unwrap();
      reset();
      toast.success(t("added successfully"));
    } catch (error) {
      toast.error(error);
    }
  };
  const { getOptions, options, isLoading } = useGetOptions(
    "/users/router/department/select/?reciever=true"
  );

  const watch_building = watch("building");
  const watch_image = watch("image") || [];

  // Buildings and floors come from the catalog tables that the admin screens
  // edit, not from a hardcoded list.
  const { buildingOptions, floorOptions, loadingBuildings, loadingFloors } =
    useLocationOptions(watch_building);

  useEffect(() => {
    resetField("floor");
  }, [watch_building, resetField]);

  return (
    <div className="mt-6">
      <Card radius="sm" shadow="sm">
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h6 className="text-xl capitalize mb-4 font-medium">
              {t("please enter ticket info")}
            </h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <SelectRHF
                name="department"
                label={t("department")}
                placeholder={t("select department")}
                control={control}
                isLoading={isLoading}
                options={options}
                onMenuOpen={(isOpen) => getOptions()}
              />
              <SelectRHF
                name="building"
                label={t("building")}
                placeholder={t("select building")}
                control={control}
                isLoading={loadingBuildings}
                options={buildingOptions}
              />
              <SelectRHF
                name="floor"
                label={t("floor")}
                placeholder={t("select floor")}
                control={control}
                isLoading={loadingFloors}
                options={floorOptions}
                isDisabled={!watch_building}
              />
              <InputRHF
                name="extension"
                label={t("extension")}
                placeholder={t("enter extension number")}
                control={control}
              />
            </div>
            <InputRHF
              name="phone"
              label={t("phone")}
              placeholder={t("enter phone number")}
              control={control}
            />
            <InputRHF
              as="textarea"
              rows="4"
              name="description"
              label={t("description")}
              placeholder={t("enter description")}
              control={control}
              className="mb-4"
            />

            <DropzoneRHF name="image" control={control} />
            <PreviewFiles
              onRemove={(fileName) => {
                const filterFiles = [...watch_image].filter(
                  (file) => file.name !== fileName
                );
                setValue("image", filterFiles);
              }}
              filesList={watch_image}
            />
            <Button
              color="primary"
              type="submit"
              isLoading={formState.isSubmitting}
            >
              {t("add ticket")}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
