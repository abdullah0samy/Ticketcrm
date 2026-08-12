import React from "react";
import { Button, Divider } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import TextareaRHF from "../RHF/TextareaRHF";
import { useDispatch } from "react-redux";
import { updatePost } from "../../redux/actions/postActions";
import { t } from "i18next";
import { toast } from "sonner";
import { HiCamera, HiPencil, HiTrash } from "react-icons/hi";
import Dialog from "../common/Dialog";

function EditPostModal({ isOpen, onClose, postData }) {
  const { id, note, medias } = postData;
  const dispatch = useDispatch();
  const { handleSubmit, control, formState } = useForm({
    defaultValues: {
      note,
    },
  });

  const onSubmit = async (values) => {
    try {
      await dispatch(updatePost({ postId: id, data: values })).unwrap();
      toast.success(t("modified successfully"));
      onClose();
    } catch (error) {
      toast.error(error);
    }
  };

  const deleteMedia = async (media_id) => {
    const payload = {
      data: { media_id },
      postId: id,
    };
    try {
      await dispatch(updatePost(payload)).unwrap();
      toast.success(t("success edit post"));
    } catch (error) {
      toast.error(error);
    }
  };

  const updateMedia = async (event, media_id) => {
    const payload = {
      data: { media: event.target.files[0] },
      postId: id,
    };
    if (media_id) {
      payload.data.media_id = media_id;
    }
    const promise = dispatch(updatePost(payload)).unwrap();
    toast.promise(promise, {
      loading: t("upload pending"),
      success: t("upload success"),
      error: t("upload error"),
    });
  };

  const mediaMapping = medias.map((media) => {
    return (
      <div className="relative">
        <img className="w-full" src={media.media} alt="alt" />
        <div className="absolute top-2 end-2 flex gap-2">
          <Button
            className="text-lg"
            color="danger"
            isIconOnly
            onClick={() => deleteMedia(media.id)}
            size="sm"
          >
            <HiTrash />
          </Button>
          <Button className="text-lg" isIconOnly size="sm">
            <HiPencil />
            <input
              type="file"
              className="opacity-0 z-20 absolute inset-0"
              onChange={(e) => updateMedia(e, media.id)}
            />
          </Button>
        </div>
      </div>
    );
  });

  return (
    <Dialog open={isOpen} onClose={onClose} size="3xl">
      <Dialog.Header className="capitalize">{t("edit post")}</Dialog.Header>
      <Dialog.Body>
        <form onSubmit={handleSubmit(onSubmit)} id="edit_post">
          <TextareaRHF name="note" control={control} />
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-center	 justify-items-center gap-3">
          {mediaMapping}
          {medias.length < 3 ? (
            <Button isIconOnly size="lg">
              <HiCamera className="text-2xl" />
              <input
                type="file"
                className="opacity-0 z-20 absolute inset-0"
                onChange={updateMedia}
              />
            </Button>
          ) : null}
        </div>
      </Dialog.Body>
      <Divider />
      <Dialog.Footer>
        <Button color="danger" variant="light" onClick={onClose}>
          {t("close")}
        </Button>
        <Button
          color="primary"
          type="submit"
          isLoading={formState.isSubmitting}
          form="edit_post"
        >
          {t("submit")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export default EditPostModal;
