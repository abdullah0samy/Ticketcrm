import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { t } from "i18next";
import { Avatar, Button, Card, Chip, Divider } from "@nextui-org/react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  HiOutlineIdentification,
  HiOutlineLockClosed,
  HiOutlineOfficeBuilding,
  HiOutlineShieldCheck,
  HiOutlineUpload,
} from "react-icons/hi";
import { setting_schema } from "../utils/validationSchema";
import InputRHF from "../components/RHF/InputRHF";
import { changePassword, updateAccount } from "../redux/actions/accountActions";

/**
 * Profile / account settings.
 *
 * This page used to render its own <Header /> and sit outside the app layout,
 * so it was the only screen in the product with no sidebar — you could reach it
 * from the menu and then have no way back. It is now a normal route inside
 * RootLayout like every other page, and shows who you are rather than only a
 * password form.
 */
export default function SettingsPage() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.account);

  const { handleSubmit, control, reset, formState } = useForm({
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_new_password: "",
    },
    resolver: yupResolver(setting_schema),
  });

  const changeImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const res = dispatch(updateAccount(formData)).unwrap();
    toast.promise(res, {
      loading: t("upload pending"),
      success: t("upload success"),
      error: t("upload error"),
    });
  };

  const onSubmit = async (values) => {
    try {
      if (values.new_password !== values.confirm_new_password) {
        toast.error(t("password confirmation"));
        return;
      }
      const res = await dispatch(changePassword(values)).unwrap();
      reset();
      toast.success(res.message || t("saved successfully"));
    } catch (error) {
      toast.error(typeof error === "string" ? error : t("something went wrong"));
    }
  };

  const fullName =
    userData?.full_name ||
    [userData?.first_name, userData?.last_name].filter(Boolean).join(" ") ||
    String(userData?.fingerid ?? "");

  return (
    <div className="py-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("account settings")}</h1>
          <p className="page-subtitle">{t("your details and password")}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 items-start">
        {/* ------------------------------------------------ identity card */}
        <Card radius="lg" shadow="sm" className="p-5 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative inline-flex flex-col items-center gap-3">
              <Avatar className="w-24 h-24" src={userData?.image} name={fullName} />
              <Button
                size="sm"
                variant="flat"
                startContent={<HiOutlineUpload />}
                className="relative overflow-hidden"
              >
                {t("upload")}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="opacity-0 absolute inset-0 cursor-pointer"
                  onChange={changeImage}
                />
              </Button>
            </div>

            <h2 className="mt-4 text-lg font-bold capitalize break-words">{fullName}</h2>
            <Chip size="sm" variant="flat" color="primary" className="mt-1">
              {t(userData?.role || "agent")}
            </Chip>
          </div>

          <Divider className="my-4" />

          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-3">
              <HiOutlineIdentification className="text-lg text-default-400 shrink-0" />
              <span className="text-default-500">{t("finger ID")}:</span>
              <span className="font-medium">{userData?.fingerid ?? "—"}</span>
            </li>
            <li className="flex items-center gap-3">
              <HiOutlineOfficeBuilding className="text-lg text-default-400 shrink-0" />
              <span className="text-default-500">{t("department")}:</span>
              <span className="font-medium break-words">
                {userData?.department?.name || "—"}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <HiOutlineShieldCheck className="text-lg text-default-400 shrink-0" />
              <span className="text-default-500">{t("role")}:</span>
              <span className="font-medium">{t(userData?.role || "agent")}</span>
            </li>
          </ul>
        </Card>

        {/* ------------------------------------------------ password form */}
        <Card radius="lg" shadow="sm" className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineLockClosed className="text-xl text-primary" />
            <h3 className="text-base font-semibold capitalize">{t("change password")}</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1">
            <InputRHF
              type="password"
              name="old_password"
              label={t("old password")}
              placeholder={t("enter old password")}
              control={control}
            />
            <div className="grid gap-1 sm:grid-cols-2">
              <InputRHF
                type="password"
                name="new_password"
                label={t("new password")}
                placeholder={t("enter new password")}
                control={control}
              />
              <InputRHF
                type="password"
                name="confirm_new_password"
                label={t("confirm password")}
                placeholder={t("enter confirm password")}
                control={control}
              />
            </div>

            <Button
              color="primary"
              type="submit"
              className="mt-3 w-full sm:w-auto sm:self-start"
              isLoading={formState.isSubmitting}
            >
              {t("save")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
