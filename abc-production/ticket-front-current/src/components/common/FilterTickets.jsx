import { Button, Card, CardHeader } from "@nextui-org/react";
import React, { useEffect } from "react";
import useParamsQuery from "./../../hooks/useParamsQuery";
import { Controller, useForm } from "react-hook-form";
import { t } from "i18next";
import MultiSelectRHF from "../RHF/MultiSelectRHF";
import { status_options } from "../../utils/selectOptions";
import useGetOptions from "../../hooks/useGetOptions";
import CreatableSelect from "react-select/creatable";
import FormControl from "../ui/FormControl";
import { getArrayFromText } from "../../utils/helper";

function FilterTickets() {
  const { getOptions, options, isLoading } = useGetOptions(
    "ticket/router/issuetypes/select/?me=true"
  );
  const { params, addParam, restParams } = useParamsQuery();

  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      id: getArrayFromText(params.id),
      issuetype: getArrayFromText(params.issuetype),
      status: getArrayFromText(params.status),
    },
  });

  const submit = (values) => {
    addParam(values);
  };
  const handleRest = () => {
    restParams();
    reset({ keepDefaultValues: false });
  };

  useEffect(() => {
    getOptions();
  }, [getOptions]);

  return (
    <Card className="mb-3 overflow-visible">
      <CardHeader className="flex flex-row justify-between items-center">
        <h6 className="text-xl capitalize">{t("filter for tickets")}</h6>
        <div className="flex gap-2">
          <Button variant="flat" onClick={handleRest}>
            {t("reset")}
          </Button>
          <Button type="submit" color="primary" form="filter">
            {t("filter")}
          </Button>
        </div>
      </CardHeader>
      <div className="px-4">
        <form onSubmit={handleSubmit(submit)} id="filter">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Controller
              name="id"
              control={control}
              defaultValue={getArrayFromText(params.id)}
              render={({ field }) => {
                const { onChange, value } = field;
                return (
                  <FormControl label={t("tickets id")}>
                    <CreatableSelect
                      onChange={(option) =>
                        onChange(option ? option.map((c) => c.value) : option)
                      }
                      value={value.map((option) => ({
                        label: option,
                        value: option,
                      }))}
                      placeholder={t("write Ticket Id")}
                      isMulti
                    />
                  </FormControl>
                );
              }}
            />
            <MultiSelectRHF
              name="status"
              label={t("status")}
              placeholder={t("select status")}
              control={control}
              options={status_options}
            />
            <MultiSelectRHF
              name="issuetype"
              label={t("issue type")}
              placeholder={t("select issue type")}
              control={control}
              isLoading={isLoading}
              options={options}
              onMenuOpen={getOptions}
            />
          </div>
        </form>
      </div>
    </Card>
  );
}

export default FilterTickets;
