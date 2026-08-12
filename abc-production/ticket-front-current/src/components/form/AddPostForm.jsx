import React from "react";
import { Button, Card, cn } from "@nextui-org/react";
import { CardBody } from "@nextui-org/react";
import TextareaRHF from "./../RHF/TextareaRHF";
import { useForm } from "react-hook-form";
import PreviewFiles from "../common/PreviewFiles";
import { HiCamera } from "react-icons/hi";
import { t } from "i18next";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../redux/actions/postActions";
import Avatar from "../ui/Avatar";

export default function AddPostForm({ className }) {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.account);

  const { handleSubmit, register, watch, setValue, control, formState, reset } =
    useForm({
      defaultValues: {
        note: "",
        media: [],
      },
    });

  const onSubmit = async (values) => {
    try {
      await dispatch(createPost(values)).unwrap();
      toast.success(t("added successfully"));
      reset();
    } catch (error) {
      toast.error(error);
    }
  };
  const watch_media = watch("media") || [];

  return (
    <Card
      radius="sm"
      shadow="sm"
      // same width as PostCard, so the composer and the feed line up
      className={cn("m-auto w-full md:w-10/12 lg:w-8/12", className)}
    >
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-2">
            {/* `name` gives NextUI the initials to fall back to; the previous
                `fallback="ad"` printed a literal "ad" for every user and is
                not a valid ReactNode for that prop. */}
            <Avatar
              className="shrink-0"
              src={userData.image}
              name={userData.full_name || String(userData.fingerid || "")}
            />
            <TextareaRHF
              placeholder={t("placeholder note")}
              name="note"
              control={control}
            />
          </div>

          <PreviewFiles
            onRemove={(fileName) => {
              const filterFiles = [...watch_media].filter(
                (file) => file.name !== fileName
              );
              setValue("media", filterFiles);
            }}
            className={"mt-3"}
            filesList={watch_media}
          />
          <div className="flex items-center justify-between">
            <Button
              color="primary"
              type="submit"
              isLoading={formState.isSubmitting}
            >
              {t("add note")}
            </Button>
            <Button isIconOnly>
              <HiCamera className="text-xl" />
              <input
                {...register("media")}
                type="file"
                className="opacity-0 z-20 absolute inset-0 cursor-pointer"
                multiple
              />
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
