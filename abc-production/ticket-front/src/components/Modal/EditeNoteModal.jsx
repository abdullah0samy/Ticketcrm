import React, { useState } from "react";
import { Form, Modal, Button, Image, Stack } from "react-bootstrap";
import { toast } from "react-toastify";
import UserAvatar from "../elements/UserAvatar";
import { Close, Camera } from "./../Icons";
import { useDispatch } from "react-redux";
import { edtieNote, updateNote } from "../../store/Slice/noteSlice";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

function EditeNoteModal({ show, onHide, data }) {
  const [noteData, setNoteData] = useState(data);
  const [note, setNote] = useState(noteData.note);
  const { i18n } = useTranslation();

  const dispatch = useDispatch();

  const removeMedia = async (media_id) => {
    const data = {
      sendData: { media_id: media_id },
      noteId: noteData.id,
    };
    try {
      const res = await dispatch(edtieNote(data)).unwrap();
      dispatch(updateNote(res));
      console.log(res);
      setNoteData(res);
      toast.success(t("delete media success"), {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
      console.log(error);
    }
  };

  const updateMedia = async (media_id, event) => {
    const formData = new FormData();
    formData.append("media_id", media_id);
    for (const key of Object.keys(event.target.files)) {
      formData.append("media", event.target.files[key]);
    }
    const data = {
      sendData: formData,
      noteId: noteData.id,
    };
    const res = dispatch(edtieNote(data)).unwrap();

    toast.promise(res, {
      pending: t("upload pending"),
      success: t("upload success"),
      error: t("upload error"),
    });

    res.then((res) => {
      dispatch(updateNote(res));
      setNoteData(res);
    });
  };

  const uploadMedia = (event) => {
    const formData = new FormData();
    for (const key of Object.keys(event.target.files)) {
      formData.append("media", event.target.files[key]);
    }
    const data = {
      sendData: formData,
      noteId: noteData.id,
    };
    const res = dispatch(edtieNote(data)).unwrap();
    toast.promise(res, {
      pending: t("upload pending"),
      success: t("upload success"),
      error: t("upload error"),
    });
    res.then((res) => {
      dispatch(updateNote(res));
      setNoteData(res);
    });
  };

  const updateTextNote = async () => {
    const data = {
      sendData: { note: note },
      noteId: noteData.id,
    };
    try {
      const res = await dispatch(edtieNote(data)).unwrap();
      dispatch(updateNote(res));
      setNoteData(res);
      onHide();
      toast.success("The modification has been saved", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return (
    <Modal
      className="note_edite"
      show={show}
      onHide={onHide}
      onEntered={() => setNote(noteData.note)}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <Modal.Header>
        <Modal.Title className="fs-5">{t("edite note")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <UserAvatar
          img={noteData.poster.image}
          name={noteData.poster.name}
          subTitle={noteData.department.name}
          dir="ltr"
        />
        <div className="my-3">
          <Form.Control
            as="textarea"
            className="border-0 shadow-none bg-light resize-none"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="hello"
          />
        </div>
        <div className="medias_conent mb-4">
          {noteData.medias.length !== 0
            ? noteData.medias.map((media) => {
                return (
                  <div className="position-relative" key={media.id}>
                    <Image
                      className="d-block w-100 mb-3"
                      src={media.media}
                      key={media.id}
                    />
                    <Stack className="action" direction="horizontal" gap={2}>
                      <Button
                        variant="danger"
                        className=" p-2"
                        size="sm"
                        onClick={() => removeMedia(media.id)}
                      >
                        <Close />
                      </Button>
                      <Button className="upload replace_img p-2">
                        <input
                          type="file"
                          name="image"
                          onChange={(e) => updateMedia(media.id, e)}
                        />
                        <Camera width="100%" className="icon" />
                      </Button>
                    </Stack>
                  </div>
                );
              })
            : null}
          {noteData.medias.length < 3 ? (
            <div className="upload upload-lg upload-img py-2 border m-auto">
              <input
                type="file"
                name="image"
                onChange={(e) => uploadMedia(e)}
              />
              <Camera width="35px" />
            </div>
          ) : null}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onHide}>
          {t("close")}
        </Button>
        <Button variant="success" onClick={updateTextNote}>
          {t("save changes")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditeNoteModal;
