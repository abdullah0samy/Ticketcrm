import React, { useContext } from "react";
import { Button } from "@nextui-org/react";
import InputRHF from "../components/RHF/InputRHF";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { login_schema } from "../utils/validationSchema";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, login } from "../redux/actions/accountActions";
import { t } from "i18next";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { webSocketContext } from "../socket-context";

const defaultValues = {
  fingerid: "",
  password: "",
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const { isLogged } = useSelector((state) => state.account);
  const { onMessageWebSocket, connectSocket } = useContext(webSocketContext);
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(login_schema),
  });

  const onSubmit = async (values) => {
    try {
      const { token } = await dispatch(login(values)).unwrap();
      localStorage.setItem("Token", token);
      const { fingerid } = await dispatch(getProfile()).unwrap();
      // if (fingerid === 7000) {
      //   document.getElementById("danger_alarm").play();
      // }
      connectSocket();
      onMessageWebSocket();
      return <Navigate to="/tickets/sent" />;
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLogged) {
    return <Navigate to="/tickets/sent" />;
  }

  return (
    <div className="h-screen w-screen box-center relative">
      <p className="absolute bottom-6 capitalize text-lg">
        {t("powered by ABC Hospital IT Team")}
      </p>
      <div className="grid grid-cols-12 w-full">
        <div className="col-span-12 md:col-span-6 h-full px-6 lg:px-16 flex items-center">
          <div className="w-full" radius="sm">
            <h5 className="text-3xl font-semibold capitalize">
              {t("welcome back")}
            </h5>
            <p className="text-default-500 mb-4">
              {t("please enter your finger ID and password")}
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <InputRHF
                name="fingerid"
                label={t("finger ID")}
                placeholder={t("enter finger ID")}
                control={control}
              />
              <InputRHF
                type="password"
                name="password"
                label={t("password")}
                placeholder={t("enter password")}
                control={control}
              />
              <Button
                type="submit"
                className="w-full"
                color="primary"
                size="lg"
                isLoading={isSubmitting}
              >
                {t("login")}
              </Button>
            </form>
          </div>
        </div>
        <div className="md:col-span-6 h-full px-8 hidden md:flex items-center p-6">
          <img className="w-full" src="/image/signin.svg" alt="signin" />
        </div>
      </div>
    </div>
  );
}
