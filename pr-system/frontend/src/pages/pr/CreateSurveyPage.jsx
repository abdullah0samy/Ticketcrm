import React, { useEffect } from "react";
import { Button, Card, CardFooter } from "@nextui-org/react";
import { useFieldArray, useForm } from "react-hook-form";
import { t } from "i18next";
import { toast } from "sonner";
import InputRHF from "../../components/RHF/InputRHF";
import DatePickerRHF from "./../../components/RHF/DatePickerRHF";
import { Radio } from "../../components/ui/RadioGroup";
import { yupResolver } from "@hookform/resolvers/yup";
import { add_survey_schema } from "../../utils/validationSchema";
import axios from "axios";
import {
  FaRegFaceFrown,
  FaRegFaceFrownOpen,
  FaRegFaceGrin,
  FaRegFaceGrinBeam,
  FaRegFaceGrinHearts,
} from "react-icons/fa6";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import RadioGroupRHF from "./../../components/RHF/RadioGroupRHF";
import { useDispatch } from "react-redux";
import { createSurvey } from "../../redux/actions/surveyActions";
import moment from "moment";
import { useTranslation } from "react-i18next";
import SwitchRHF from "./../../components/RHF/SwitchRHF";
import { prApi } from "../../api/axios-global";

function CreateSurveyPage() {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();

  const { handleSubmit, control, setValue, resetField, formState, watch } =
    useForm({
      defaultValues: {
        info: {
          room_no: "",
          admission_no: "",
          enter_date: "",
          doctor: "",
          patient: "",
          phone: "",
          age: "",
        },
        satisfied: true,
        comment: "",
        answers: [],
        flag: "true",
        survey_type: "in_person",
      },
      resolver: yupResolver(add_survey_schema),
      mode: "onChange",
    });

  const { fields } = useFieldArray({
    control,
    name: "answers",
  });
  const watch_flag = watch("flag");
  const watch_satisfied = watch("satisfied");

  const onSubmit = async (values) => {
    try {
      values.info.enter_date = moment(values.info.enter_date).format(
        "YYYY-MM-DDThh:mm"
      );
      await dispatch(createSurvey(values)).unwrap();
      resetField("info");
      toast.success(t("added successfully"));
    } catch (error) {
      toast.error(error);
    }
  };
  useEffect(() => {
    const getQuestions = async () => {
      try {
        const results = await prApi.get("/pr/router/question/", {
          params: { status: watch_flag },
        });
        setValue("answers", results);
      } catch (error) {
        toast.error(error);
      }
    };
    getQuestions();
  }, [setValue, watch_flag]);

  useEffect(() => {
    const SatisfyMessage = async () => {
      try {
        const { message } = await prApi.get("/pr/satisfy-message/", {
          params: { satisfied: watch_satisfied },
        });
        setValue("comment", message);
      } catch (error) {
        toast.error(error);
      }
    };
    SatisfyMessage();
  }, [setValue, watch_satisfied]);

  const questionsMapping = fields.map((field, idx) => {
    return (
      <RadioGroupRHF
        key={field.id}
        orientation="row"
        label={field.question}
        control={control}
        name={`answers.${idx}.answer`}
        dir={i18n.dir()}
        classNames={{
          label: "font-medium text-lg mb-1",
        }}
      >
        {field.group === "rate" ? (
          <>
            <Radio
              isCustom
              className={"flex flex-col items-center text-sm px-4 capitalize"}
              value={"1"}
            >
              <FaRegFaceFrown className="text-2xl" />
              {t("extremely unsatisfied")}
            </Radio>
            <Radio
              isCustom
              className={"flex flex-col items-center text-sm px-4 capitalize"}
              value={"2"}
            >
              <FaRegFaceFrownOpen className="text-2xl" />
              {t("unsatisfied")}
            </Radio>
            <Radio
              isCustom
              className={"flex flex-col items-center text-sm px-4 capitalize"}
              value={"3"}
            >
              <FaRegFaceGrin className="text-2xl" />
              {t("normal")}
            </Radio>
            <Radio
              isCustom
              className={"flex flex-col items-center text-sm px-4 capitalize"}
              value={"4"}
            >
              <FaRegFaceGrinBeam className="text-2xl" />
              {t("satisfied")}
            </Radio>
            <Radio
              isCustom
              className={"flex flex-col items-center text-sm px-4 capitalize"}
              value={"5"}
            >
              <FaRegFaceGrinHearts className="text-2xl" />
              {t("extremely satisfied")}
            </Radio>
          </>
        ) : (
          <>
            <Radio isCustom value={1} className="capitalize">
              {t("yes")}
            </Radio>
            <Radio isCustom value={0} className="capitalize">
              {t("no")}
            </Radio>
          </>
        )}
      </RadioGroupRHF>
    );
  });

  return (
    <div className="py-4">
      <div className="mb-3">
        <h2 className="text-2xl capitalize leading-1 font-medium">
          {t("create new survey")}
        </h2>
        <Breadcrumbs size="lg">
          <BreadcrumbItem href="/">{t("home")}</BreadcrumbItem>
          <BreadcrumbItem>{t("create")}</BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <Card shadow="sm">
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} id="form">
            {/* step 1 content */}
            <div className="mb-4" id="step_1">
              <h5 className="text-2xl font-medium capitalize mb-2">
                {t("report information")}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <InputRHF
                  name="info.doctor"
                  label={t("doctor")}
                  placeholder={t("enter doctor name")}
                  control={control}
                  required
                />
                <InputRHF
                  name="info.patient"
                  label={t("patient")}
                  placeholder={t("enter patient name")}
                  control={control}
                  required
                />
                <DatePickerRHF
                  name="info.enter_date"
                  label={t("enter date")}
                  placeholderText={t("select enter date")}
                  control={control}
                  withPortal
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <InputRHF
                  name="info.phone"
                  label={t("phone")}
                  placeholder={t("enter phone number")}
                  control={control}
                  required
                />
                <InputRHF
                  type="number"
                  name="info.room_no"
                  label={t("room number")}
                  placeholder={t("enter room number")}
                  control={control}
                  required
                />
                <InputRHF
                  type="number"
                  name="info.admission_no"
                  label={t("medical number")}
                  placeholder={t("enter medical number")}
                  control={control}
                  required
                />
              </div>
              <SwitchRHF
                label={t("satisfied")}
                className="mb-3"
                name="satisfied"
                control={control}
                defaultSelected
              />
              <InputRHF
                as="textarea"
                rows="4"
                name="comment"
                label={t("comment")}
                placeholder={t("enter comment")}
                control={control}
                className="mb-4"
              />
              <RadioGroupRHF
                name="survey_type"
                control={control}
                orientation="row"
                dir={i18n.dir()}
                label={t("type of interview")}
                classNames={{
                  label: "font-medium text-base mb-2",
                }}
              >
                <Radio isCustom value={"in_person"}>
                  {t("in person")}
                </Radio>
                <Radio isCustom value={"call"}>
                  {t("call")}
                </Radio>
              </RadioGroupRHF>
              <RadioGroupRHF
                name="flag"
                control={control}
                orientation="row"
                dir={i18n.dir()}
                label={t("type of clinic")}
                classNames={{
                  label: "font-medium text-base mb-2",
                }}
              >
                <Radio isCustom value={"true"}>
                  {t("out patient")}
                </Radio>
                <Radio isCustom value={"false"}>
                  {t("in patient")}
                </Radio>
              </RadioGroupRHF>
            </div>
            {/* step 2 content */}
            <div id="step_1 pt-4">
              <h5 className="text-2xl font-medium capitalize mb-2">
                {t("patient questions")}
              </h5>
              {questionsMapping}
            </div>
          </form>
        </div>
        <CardFooter>
          <Button
            type="submit"
            color="primary"
            form="form"
            isLoading={formState.isSubmitting}
          >
            {t("create survey")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
//support.csch-svu.com:8080/api/pr/satisfy-message/
export default CreateSurveyPage;
