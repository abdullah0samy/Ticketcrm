import * as Yup from "yup";

export const login_schema = Yup.object({
  fingerid: Yup.string()
    .required("required")
    .max(10, "This field must not exceed 15 characters"),
  password: Yup.string().required("required"),
});

export const add_ticket_schema = Yup.object({
  department: Yup.string().required("required"),
  building: Yup.string().required("required"),
  floor: Yup.string().required("required"),
  extension: Yup.number().min(1000).max(9999).required("required"),
  description : Yup.string().required("required"),
});

export const setting_schema = Yup.object({
  old_password: Yup.string().required("Required"),
  new_password: Yup.string().required("Required"),
  confirm_new_password: Yup.string().required("Required"),
});
export const add_survey_schema = Yup.object({
  info: Yup.object().shape({
    doctor: Yup.string().required("required"),
    enter_date: Yup.string().required("required"),
    patient: Yup.string().required("required"),
    room_no: Yup.string().required("required"),
    admission_no: Yup.string().required("required"),
    phone: Yup.string().required("required"),
  }),
  answers: Yup.array().of(
    Yup.object().shape({
      answer: Yup.string().required("required"),
    })
  ),
});
