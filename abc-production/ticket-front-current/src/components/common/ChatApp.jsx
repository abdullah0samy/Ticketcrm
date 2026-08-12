/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Textarea,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Image,
  Spinner,
} from "@nextui-org/react";
import { BsSend } from "react-icons/bs";
import {
  HiOutlinePaperClip,
  HiOutlineMicrophone,
  HiOutlinePhoto,
  HiOutlineDocument,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlinePencilSquare,
  HiOutlineArrowUturnLeft,
  HiOutlineArrowDown,
  HiOutlineArrowDownTray,
  HiOutlineEllipsisVertical,
  HiOutlineStop,
} from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import HandleError from "./HandleError";
import EmojiPicker from "./EmojiPicker";
import AudioMessage from "./AudioMessage";
import useVoiceRecorder, { isRecordingSupported } from "../../hooks/useVoiceRecorder";
import {
  createTicketMessage,
  getMessages,
  getMoreMessages,
  updateTicketMessage,
  deleteTicketMessage,
} from "../../redux/actions/chatActions";
import { toast } from "sonner";
import { t } from "i18next";
import moment from "moment/moment";
import LoadMoreData from "./LoadMoreData";
import { cn } from "../../utils/helper";

const MAX_UPLOAD = 25 * 1024 * 1024;

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatClock = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** Human day separator: Today / Yesterday / the date. */
const dayLabel = (value) => {
  const day = moment(value);
  if (day.isSame(moment(), "day")) return t("today");
  if (day.isSame(moment().subtract(1, "day"), "day")) return t("yesterday");
  return day.format("LL");
};

export default function ChatApp({ ticketId }) {
  const dispatch = useDispatch();
  const {
    data: { results, next },
    isLoading,
    error,
  } = useSelector((state) => state.chat);
  const { userData } = useSelector((state) => state.account);

  const [text, setText] = useState("");
  const [pending, setPending] = useState(null); // { file, previewUrl, kind }
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showJump, setShowJump] = useState(false);

  const scrollerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const textareaRef = useRef(null);
  const recorder = useVoiceRecorder();

  useEffect(() => {
    dispatch(getMessages({ id: ticketId }));
  }, [dispatch, ticketId]);

  // Object URLs for local previews have to be revoked or the blob stays in
  // memory for the lifetime of the tab.
  useEffect(() => {
    return () => {
      if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    };
  }, [pending]);

  const isNearBottom = () => {
    const el = scrollerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  const scrollToBottom = (behavior = "smooth") => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };

  // Follow the conversation only when the reader is already at the bottom;
  // yanking the view down while someone scrolls back through history is the
  // single most irritating thing a chat can do.
  const lastIdRef = useRef(null);
  useEffect(() => {
    const lastId = results[results.length - 1]?.id ?? null;
    if (lastId === lastIdRef.current) return;
    const first = lastIdRef.current === null;
    lastIdRef.current = lastId;
    if (first || isNearBottom()) {
      requestAnimationFrame(() => scrollToBottom(first ? "auto" : "smooth"));
    } else {
      setShowJump(true);
    }
  }, [results]);

  const attachFile = (file, kind) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD) {
      toast.error(t("attachment too large"));
      return;
    }
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    const isImage = file.type.startsWith("image/");
    setPending({
      file,
      kind: kind ?? (isImage ? "image" : "file"),
      previewUrl: isImage ? URL.createObjectURL(file) : null,
    });
  };

  const clearPending = () => {
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
  };

  const send = async () => {
    if (isSending) return;
    const body = text.trim();

    if (editing) {
      if (!body) return;
      try {
        setIsSending(true);
        await dispatch(updateTicketMessage({ id: editing.id, comment: body })).unwrap();
        setEditing(null);
        setText("");
      } catch (err) {
        toast.error(typeof err === "string" ? err : t("upload error"));
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (!body && !pending) return;

    try {
      setIsSending(true);
      let payload;
      if (pending) {
        payload = new FormData();
        payload.append("ticket", ticketId);
        payload.append("comment", body);
        payload.append("attachment", pending.file, pending.file.name);
        if (pending.duration) payload.append("duration", pending.duration);
        if (replyTo) payload.append("reply_to", replyTo.id);
      } else {
        payload = { ticket: ticketId, comment: body };
        if (replyTo) payload.reply_to = replyTo.id;
      }
      await dispatch(createTicketMessage(payload)).unwrap();
      setText("");
      setReplyTo(null);
      clearPending();
      requestAnimationFrame(() => scrollToBottom());
    } catch (err) {
      toast.error(typeof err === "string" ? err : t("upload error"));
    } finally {
      setIsSending(false);
    }
  };

  const startRecording = async () => {
    const ok = await recorder.start();
    if (!ok) {
      toast.error(
        recorder.error === "denied"
          ? t("microphone denied")
          : t("microphone unavailable")
      );
    }
  };

  const finishRecording = async () => {
    const seconds = recorder.seconds;
    const blob = await recorder.stop();
    if (!blob || blob.size === 0) return;
    const extension = (blob.type.split("/")[1] || "webm").split(";")[0];
    const file = new File([blob], `voice-${Date.now()}.${extension}`, {
      type: blob.type,
    });
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending({ file, kind: "audio", previewUrl: null, duration: seconds });
  };

  const removeMessage = async (message) => {
    try {
      await dispatch(deleteTicketMessage(message.id)).unwrap();
      toast.success(t("deleted successfully"));
    } catch (err) {
      toast.error(typeof err === "string" ? err : t("upload error"));
    }
  };

  const beginEdit = (message) => {
    setEditing(message);
    setReplyTo(null);
    clearPending();
    setText(message.comment || "");
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  // Group consecutive messages by day so the list gets date separators, and by
  // author so a burst from one person renders as one visual block.
  const grouped = useMemo(() => {
    const out = [];
    let lastDay = null;
    results.forEach((message, index) => {
      const day = moment(message.created_at).format("YYYY-MM-DD");
      if (day !== lastDay) {
        out.push({ type: "day", key: `day-${day}`, value: message.created_at });
        lastDay = day;
      }
      const previous = results[index - 1];
      const sameAuthor =
        previous &&
        previous.commenter?.id === message.commenter?.id &&
        moment(message.created_at).diff(moment(previous.created_at), "minutes") < 5 &&
        moment(previous.created_at).format("YYYY-MM-DD") === day;
      out.push({
        type: "message",
        key: `m-${message.id}`,
        message,
        compact: Boolean(sameAuthor),
      });
    });
    return out;
  }, [results]);

  const canSend = Boolean(text.trim() || pending) && !isSending;

  return (
    <div className="flex h-full flex-col bg-default-50">
      <div
        ref={scrollerRef}
        onScroll={() => setShowJump(!isNearBottom())}
        className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2"
      >
        <LoadMoreData
          next={next}
          dispatchFn={() => getMoreMessages(next)}
          btnProps={{ size: "sm" }}
        />
        <HandleError isLoading={isLoading} error={error} isEmpty={!results.length}>
          {grouped.map((entry) =>
            entry.type === "day" ? (
              <div key={entry.key} className="my-2 flex justify-center">
                <span className="rounded-full bg-default-200/70 px-3 py-1 text-tiny text-default-600">
                  {dayLabel(entry.value)}
                </span>
              </div>
            ) : (
              <Message
                key={entry.key}
                messageData={entry.message}
                compact={entry.compact}
                currentUserId={userData?.id}
                onReply={setReplyTo}
                onEdit={beginEdit}
                onDelete={removeMessage}
              />
            )
          )}
        </HandleError>
      </div>

      {showJump && (
        <div className="pointer-events-none relative">
          <Button
            isIconOnly
            radius="full"
            size="sm"
            color="primary"
            onPress={() => {
              scrollToBottom();
              setShowJump(false);
            }}
            className="pointer-events-auto absolute -top-12 end-4 shadow-lg"
            aria-label={t("scroll to latest")}
          >
            <HiOutlineArrowDown className="text-lg" />
          </Button>
        </div>
      )}

      <div className="border-t border-default-200 bg-white">
        {(replyTo || editing) && (
          <div className="flex items-start gap-2 border-b border-default-200 bg-default-100 px-3 py-2">
            <div className="h-full w-1 shrink-0 self-stretch rounded-full bg-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-tiny font-semibold text-primary">
                {editing
                  ? t("edit message")
                  : `${t("replying to")} ${replyTo.commenter?.name ?? ""}`}
              </p>
              <p className="line-clamp-1 text-tiny text-default-600">
                {(editing ?? replyTo).comment ||
                  t((editing ?? replyTo).kind || "attachments")}
              </p>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              onPress={() => {
                setReplyTo(null);
                setEditing(null);
                setText("");
              }}
            >
              <HiOutlineXMark className="text-lg" />
            </Button>
          </div>
        )}

        {pending && (
          <div className="flex items-center gap-3 border-b border-default-200 bg-default-100 px-3 py-2">
            {pending.previewUrl ? (
              <img
                src={pending.previewUrl}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary">
                {pending.kind === "audio" ? (
                  <HiOutlineMicrophone className="text-xl" />
                ) : (
                  <HiOutlineDocument className="text-xl" />
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-small font-medium">
                {pending.kind === "audio"
                  ? `${t("voice message")} · ${formatClock(pending.duration ?? 0)}`
                  : pending.file.name}
              </p>
              <p className="text-tiny text-default-500">
                {formatBytes(pending.file.size)}
              </p>
            </div>
            <Button isIconOnly size="sm" variant="light" radius="full" onPress={clearPending}>
              <HiOutlineTrash className="text-lg text-danger" />
            </Button>
          </div>
        )}

        {recorder.isRecording ? (
          <div className="flex items-center gap-3 px-3 py-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-danger" />
            </span>
            <span className="tabular-nums text-small font-medium text-danger">
              {formatClock(recorder.seconds)}
            </span>
            <div className="flex flex-1 items-center gap-[3px]">
              {Array.from({ length: 28 }).map((_, index) => (
                <span
                  key={index}
                  className="w-full rounded-full bg-danger/70 transition-[height] duration-100"
                  style={{
                    height: `${Math.max(
                      3,
                      recorder.level * 24 * (0.5 + ((index * 7) % 10) / 10)
                    )}px`,
                  }}
                />
              ))}
            </div>
            <Tooltip content={t("cancel")}>
              <Button isIconOnly size="sm" variant="light" radius="full" onPress={recorder.cancel}>
                <HiOutlineTrash className="text-lg text-default-500" />
              </Button>
            </Tooltip>
            <Tooltip content={t("stop")}>
              <Button isIconOnly size="sm" color="danger" radius="full" onPress={finishRecording}>
                <HiOutlineStop className="text-lg" />
              </Button>
            </Tooltip>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
            className="flex items-end gap-1 px-2 py-2 sm:gap-2 sm:px-3"
          >
            <EmojiPicker
              isDisabled={isSending}
              onPick={(emoji) => {
                setText((value) => value + emoji);
                textareaRef.current?.focus();
              }}
            />

            <Dropdown placement="top-start">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  isDisabled={isSending || Boolean(editing)}
                  className="text-default-500"
                  aria-label={t("attachments")}
                >
                  <HiOutlinePaperClip className="text-xl" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label={t("attachments")}>
                <DropdownItem
                  key="image"
                  startContent={<HiOutlinePhoto className="text-lg" />}
                  onPress={() => imageInputRef.current?.click()}
                >
                  {t("photo")}
                </DropdownItem>
                <DropdownItem
                  key="file"
                  startContent={<HiOutlineDocument className="text-lg" />}
                  onPress={() => fileInputRef.current?.click()}
                >
                  {t("file")}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                attachFile(event.target.files?.[0], "image");
                event.target.value = "";
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(event) => {
                attachFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <Textarea
              ref={textareaRef}
              minRows={1}
              maxRows={4}
              value={text}
              variant="bordered"
              radius="lg"
              placeholder={t("type a message")}
              onValueChange={setText}
              onKeyDown={(event) => {
                // Enter sends, Shift+Enter breaks the line — the convention
                // everyone already has in their fingers.
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              classNames={{ inputWrapper: "bg-default-100" }}
            />

            {canSend || editing ? (
              <Button
                type="submit"
                color="primary"
                isIconOnly
                radius="full"
                isDisabled={!canSend && !(editing && text.trim())}
                aria-label={t("save")}
              >
                {isSending ? <Spinner size="sm" color="white" /> : <BsSend className="text-lg" />}
              </Button>
            ) : (
              <Tooltip
                content={
                  isRecordingSupported() ? t("record voice") : t("microphone unavailable")
                }
              >
                <Button
                  isIconOnly
                  color="primary"
                  radius="full"
                  isDisabled={!isRecordingSupported()}
                  onPress={startRecording}
                  aria-label={t("record voice")}
                >
                  <HiOutlineMicrophone className="text-lg" />
                </Button>
              </Tooltip>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function Message({ messageData, compact, currentUserId, onReply, onEdit, onDelete }) {
  const {
    id,
    comment,
    commenter,
    created_at,
    kind,
    attachment,
    attachment_name,
    attachment_size,
    duration,
    edited_at,
    reply_preview,
  } = messageData;

  // `commenter` is null once the account that wrote the message is deleted.
  const isMine = commenter?.id === currentUserId;

  return (
    <div
      className={cn(
        "group flex w-full flex-col",
        compact ? "mt-0.5" : "mt-3",
        isMine ? "items-end" : "items-start"
      )}
    >
      {!compact && (
        <span className="mb-0.5 px-1 text-tiny font-medium text-default-500">
          {commenter?.name ?? t("unknown")}
        </span>
      )}

      <div
        className={cn(
          "flex max-w-[85%] items-center gap-1 sm:max-w-[75%]",
          isMine ? "flex-row" : "flex-row-reverse"
        )}
      >
        <MessageActions
          isMine={isMine}
          onReply={() => onReply(messageData)}
          onEdit={() => onEdit(messageData)}
          onDelete={() => onDelete(messageData)}
          canEdit={isMine && kind === "text"}
        />

        <div
          className={cn(
            "min-w-0 rounded-2xl px-3 py-2 shadow-sm",
            isMine
              ? "rounded-br-md bg-primary text-white"
              : "rounded-bl-md bg-white text-default-800"
          )}
        >
          {reply_preview && (
            <div
              className={cn(
                "mb-1.5 rounded-lg border-s-2 px-2 py-1",
                isMine ? "border-white/60 bg-white/15" : "border-primary bg-default-100"
              )}
            >
              <p
                className={cn(
                  "text-tiny font-semibold",
                  isMine ? "text-white/90" : "text-primary"
                )}
              >
                {reply_preview.commenter_name ?? t("unknown")}
              </p>
              <p
                className={cn(
                  "line-clamp-2 text-tiny",
                  isMine ? "text-white/80" : "text-default-600"
                )}
              >
                {reply_preview.comment || t(reply_preview.kind)}
              </p>
            </div>
          )}

          {kind === "image" && attachment && (
            <a href={attachment} target="_blank" rel="noreferrer" className="block">
              <Image
                src={attachment}
                alt={attachment_name || ""}
                className="max-h-64 w-auto rounded-lg object-cover"
                radius="lg"
              />
            </a>
          )}

          {kind === "audio" && attachment && (
            <AudioMessage src={attachment} duration={duration} seed={id} isMine={isMine} />
          )}

          {kind === "file" && attachment && (
            <a
              href={attachment}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "flex items-center gap-2 rounded-lg px-1 py-1",
                isMine ? "hover:bg-white/15" : "hover:bg-default-100"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  isMine ? "bg-white/20" : "bg-primary-100 text-primary"
                )}
              >
                <HiOutlineDocument className="text-lg" />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-1 block text-small font-medium">
                  {attachment_name || t("file")}
                </span>
                <span
                  className={cn(
                    "text-tiny",
                    isMine ? "text-white/75" : "text-default-500"
                  )}
                >
                  {formatBytes(attachment_size)}
                </span>
              </span>
              <HiOutlineArrowDownTray className="ms-1 shrink-0 text-lg opacity-70" />
            </a>
          )}

          {comment ? (
            <p
              className={cn(
                "whitespace-pre-wrap break-words text-small",
                attachment && "mt-1.5"
              )}
            >
              {comment}
            </p>
          ) : null}

          <div
            className={cn(
              "mt-1 flex items-center justify-end gap-1 text-tiny",
              isMine ? "text-white/70" : "text-default-400"
            )}
          >
            {edited_at && <span>{t("edited")}</span>}
            <span>{moment(created_at).format("LT")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageActions({ isMine, canEdit, onReply, onEdit, onDelete }) {
  return (
    <Dropdown placement="bottom">
      <DropdownTrigger>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          radius="full"
          // Hover-only on pointer devices; always visible on touch, where
          // there is no hover to reveal it with.
          className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={t("action")}
        >
          <HiOutlineEllipsisVertical className="text-lg text-default-400" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label={t("action")}>
        <DropdownItem
          key="reply"
          startContent={<HiOutlineArrowUturnLeft className="text-lg" />}
          onPress={onReply}
        >
          {t("reply")}
        </DropdownItem>
        {canEdit ? (
          <DropdownItem
            key="edit"
            startContent={<HiOutlinePencilSquare className="text-lg" />}
            onPress={onEdit}
          >
            {t("edit")}
          </DropdownItem>
        ) : null}
        {isMine ? (
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            startContent={<HiOutlineTrash className="text-lg" />}
            onPress={onDelete}
          >
            {t("delete")}
          </DropdownItem>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
}
