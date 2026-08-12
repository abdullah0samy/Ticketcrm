import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Form, Modal } from "react-bootstrap";
import { AddTicketMessage, closeChat } from "../../store/Slice/ChatSlice";
import { t } from "i18next";
import MoreData from "../elements/MoreData";
import { getNextMessages } from "../../store/Slice/ChatSlice";
import { updateComment } from "../../store/Slice/ticketSlice";
import HandelAlert from "../elements/HandelAlert";
import { useTranslation } from "react-i18next";
import { Send } from "../Icons";
import Message from "../elements/Message";
import { toast } from "react-toastify";
import { newSocket } from "../../App";

function ChatModal() {
  const dispatch = useDispatch();
  const [pageNum, setPageNum] = useState(2);
  const [request_id] = useState(Math.random());
  const { i18n } = useTranslation();

  const { messagesList, loading, error, next, showChat, ticketId } =
    useSelector((state) => state.chat);

  const { userData } = useSelector((state) => state.user);

  let schema = Yup.object({
    comment: Yup.string().required("Required"),
  });

  const { register, handleSubmit, resetField, formState } = useForm({
    resolver: yupResolver(schema),
  });

  const submitForm = async (data) => {
    data.ticket = ticketId;
    try {
      const { comment } = await dispatch(AddTicketMessage(data)).unwrap();
      resetField("comment");
      dispatch(updateComment({ id: ticketId, comment }));
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const getMoreData = async () => {
    try {
      await dispatch(getNextMessages({ pageNum, ticketId })).unwrap();
      setPageNum(pageNum + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const onEnter = async () => {
    setPageNum(2);
    console.log(ticketId);
    newSocket.socket.send(
      JSON.stringify({
        action: "join_ticket",
        request_id: request_id,
        pk: ticketId,
      })
    );
  };

  const onHide = async () => {
    dispatch(closeChat());
    newSocket.socket.send(
      JSON.stringify({
        action: "leave_ticket",
        request_id: request_id,
        pk: ticketId,
      })
    );
  };

  const messagesMapping = messagesList.map((item) => {
    return (
      <Message
        commentData={item}
        key={item.id}
        is_mine={userData.id === item.commenter.id}
      />
    );
  });

  return (
    <Modal
      className="chat"
      show={showChat}
      onEnter={onEnter}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <Modal.Title id="contained-modal-title-vcenter">
          {t("chat")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="chat-body" dir="ltr">
        <MoreData next={next} text={t("more comments")} action={getMoreData} />
        {messagesMapping}
        <HandelAlert
          loading={loading}
          error={error}
          empty={t("start conversation")}
          dataList={messagesList}
        />
      </Modal.Body>
      <Modal.Footer className="d-block">
        <Form onSubmit={handleSubmit(submitForm)} id="send-message">
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              className="chat-input"
              placeholder={t("placeholder message")}
              {...register("comment")}
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
            />
            <Button
              type="submit"
              form="send-message"
              disabled={formState.isSubmitting}
            >
              <Send />
            </Button>
          </div>
        </Form>
      </Modal.Footer>
    </Modal>
  );
}

export default React.memo(ChatModal);
