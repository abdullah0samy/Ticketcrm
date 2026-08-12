import React, { useState } from "react";
import { Card, Carousel, Image, Stack } from "react-bootstrap";
import UserAvatar from "./../elements/UserAvatar";
import { Edite, Trash } from "../Icons";
import { useDispatch, useSelector } from "react-redux";
import { deleteNote } from "./../../store/Slice/noteSlice";
import { toast } from "react-toastify";
import EditeNoteModal from "../Modal/EditeNoteModal";
import moment from "moment";
import Swal from "sweetalert2";
import { t } from "i18next";

function NoteCard({ noteData }) {
  const { id, note, medias, poster, created_at } = noteData;
  const dispatch = useDispatch();
  const [modalShowEditeNote, setModalShowEditeNote] = useState(false);
  const { userData } = useSelector((state) => state.user);
  const handelDeleteNote = async () => {
    try {
      const res = await Swal.fire({
        title: t("swal title"),
        showCancelButton: true,
        icon: "info",
        confirmButtonText: t("yes"),
        cancelButtonText: t("cancel"),
        confirmButtonColor: "#198754",
        cancelButtonColor: "#dc3545",
      });
      if (res.isConfirmed) {
        await dispatch(deleteNote(id)).unwrap();
        toast.success(t("delete note success"), {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  return (
    <>
      <EditeNoteModal
        show={modalShowEditeNote}
        onHide={() => setModalShowEditeNote(false)}
        data={noteData}
      />
      <Card className="note_card border-0 overflow-hidden">
        <Card.Header className="bg-light d-flex justify-content-between py-3 border-bottom-0">
          <UserAvatar
            img={poster.image}
            name={poster.name}
            subTitle={moment(created_at).format("l LT")}
          />
          {poster.id === userData.id ? (
            <Stack direction="horizontal" gap={2}>
              <Edite
                className="edite"
                onClick={() => setModalShowEditeNote(true)}
              />
              <Trash className="delete" onClick={handelDeleteNote} />
            </Stack>
          ) : null}
        </Card.Header>
        <Card.Body className="p-0">
          <Card.Text className="p-3">{note}</Card.Text>
          <Carousel className="w-100 center" touch interval={null}>
            {medias.length !== 0
              ? medias.map((media) => {
                  return (
                    <Carousel.Item key={media.id}>
                      <Image className="d-block w-100" src={media.media} />
                    </Carousel.Item>
                  );
                })
              : null}
          </Carousel>
        </Card.Body>
      </Card>
    </>
  );
}

export default NoteCard;
