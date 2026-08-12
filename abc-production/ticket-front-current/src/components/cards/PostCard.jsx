import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Spinner,
  User,
  cn,
} from "@nextui-org/react";
import axios from "axios";
import { t } from "i18next";
import moment from "moment/moment";
import React, { useState } from "react";
import {
  HiDotsVertical,
  HiOutlineChatAlt2,
  HiOutlineHeart,
  HiHeart,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineBookmark,
  HiBookmark,
} from "react-icons/hi";
import EditPostModal from "../modals/EditPostModal";
import { useDispatch, useSelector } from "react-redux";
import { deletePostById } from "../../redux/actions/postActions";
import { toast } from "sonner";
import Carousel from "react-gallery-carousel";
import { useTranslation } from "react-i18next";

export default function PostCard({ className, postData }) {
  const {
    id,
    created_at,
    note,
    poster,
    medias = [],
    likes_count = 0,
    liked_by_me = false,
    comments_count = 0,
    pinned = false,
  } = postData;

  const [isEditPost, setIsEditPost] = useState(false);
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { userData } = useSelector((state) => state.account);

  // Likes and comments are per-card state on purpose — reloading the whole
  // feed to reflect one tap would lose the reader's scroll position.
  const [liked, setLiked] = useState(liked_by_me);
  const [likes, setLikes] = useState(likes_count);
  const [isPinned, setIsPinned] = useState(pinned);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [count, setCount] = useState(comments_count);

  const isMine = poster?.id === userData.id;
  const canPin = userData.role === "manager" || userData.role === "administration";

  const deletePost = async () => {
    try {
      await dispatch(deletePostById(id)).unwrap();
      toast.success(t("deleted successfully"));
    } catch (error) {
      toast.error(error);
    }
  };

  const toggleLike = async () => {
    // optimistic: the tap should feel instant, and it is trivially reversible
    const previous = { liked, likes };
    setLiked(!liked);
    setLikes(likes + (liked ? -1 : 1));
    try {
      const res = await axios.post(`/ticket/router/note/${id}/like/`);
      setLiked(res.liked);
      setLikes(res.likes_count);
    } catch (error) {
      setLiked(previous.liked);
      setLikes(previous.likes);
      toast.error(typeof error === "string" ? error : t("something went wrong"));
    }
  };

  const togglePin = async () => {
    try {
      const res = await axios.patch(`/ticket/router/note/${id}/pin/`);
      setIsPinned(res.pinned);
      toast.success(t(res.pinned ? "pinned" : "unpinned"));
    } catch (error) {
      toast.error(typeof error === "string" ? error : t("something went wrong"));
    }
  };

  const loadComments = async () => {
    if (showComments) return setShowComments(false);
    setShowComments(true);
    setCommentsLoading(true);
    try {
      const res = await axios.get(`/ticket/router/note-comment/?note=${id}`);
      setComments(res?.results ?? res ?? []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const sendComment = async () => {
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const res = await axios.post("/ticket/router/note-comment/", {
        note: id,
        comment: text,
      });
      setComments((list) => [...list, res]);
      setCount((n) => n + 1);
      setDraft("");
    } catch (error) {
      toast.error(typeof error === "string" ? error : t("something went wrong"));
    } finally {
      setSending(false);
    }
  };

  const images = medias.map((img) => ({ src: img.media }));

  return (
    <>
      {isEditPost ? (
        <EditPostModal
          isOpen={isEditPost}
          onClose={() => setIsEditPost(false)}
          postData={postData}
        />
      ) : null}

      <Card
        radius="lg"
        shadow="sm"
        className={cn("w-full md:w-10/12 lg:w-8/12", className)}
      >
        <CardHeader className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <User
              name={poster?.name}
              description={moment(created_at).format("l LT")}
              classNames={{
                name: "text-sm sm:text-base capitalize font-medium",
                description: "text-xs",
              }}
              avatarProps={{ src: poster?.image, isBordered: true, size: "sm" }}
            />
            {isPinned ? (
              <Chip size="sm" color="warning" variant="flat" startContent={<HiBookmark />}>
                {t("pinned")}
              </Chip>
            ) : null}
          </div>

          {isMine || canPin ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly radius="full" variant="light" size="sm">
                  <HiDotsVertical />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label={t("note actions")}>
                {canPin ? (
                  <DropdownItem
                    key="pin"
                    startContent={
                      isPinned ? <HiBookmark className="text-lg" /> : <HiOutlineBookmark className="text-lg" />
                    }
                    onPress={togglePin}
                  >
                    {t(isPinned ? "unpin note" : "pin note")}
                  </DropdownItem>
                ) : null}
                {isMine ? (
                  <DropdownItem
                    key="edit"
                    startContent={<HiOutlinePencil className="text-lg" />}
                    onPress={() => setIsEditPost(true)}
                  >
                    {t("edit note")}
                  </DropdownItem>
                ) : null}
                {isMine ? (
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<HiOutlineTrash className="text-lg" />}
                    onPress={deletePost}
                  >
                    {t("delete note")}
                  </DropdownItem>
                ) : null}
              </DropdownMenu>
            </Dropdown>
          ) : null}
        </CardHeader>

        <Divider />

        <CardBody>
          <p className="mb-2.5 whitespace-pre-wrap break-words px-1 sm:px-2">{note}</p>
          {medias.length ? (
            <Carousel images={images} isRTL={i18n.dir() === "rtl"} canAutoPlay={false} />
          ) : null}
        </CardBody>

        <Divider />

        <CardFooter className="flex flex-col items-stretch gap-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="light"
              color={liked ? "danger" : "default"}
              startContent={liked ? <HiHeart className="text-lg" /> : <HiOutlineHeart className="text-lg" />}
              onPress={toggleLike}
            >
              {likes > 0 ? likes : ""} {t("like")}
            </Button>
            <Button
              size="sm"
              variant="light"
              startContent={<HiOutlineChatAlt2 className="text-lg" />}
              onPress={loadComments}
            >
              {count > 0 ? count : ""} {t("comments")}
            </Button>
          </div>

          {showComments ? (
            <div className="border-t border-default-100 pt-2">
              {commentsLoading ? (
                <div className="py-4 box-center"><Spinner size="sm" /></div>
              ) : comments.length ? (
                <div className="flex flex-col gap-3 mb-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <img
                        src={c.commenter?.image}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="bg-default-100 rounded-2xl px-3 py-2 min-w-0">
                        <p className="text-xs font-semibold capitalize">{c.commenter?.name}</p>
                        <p className="text-sm break-words whitespace-pre-wrap">{c.comment}</p>
                        <p className="text-[11px] text-default-400 mt-0.5">
                          {moment(c.created_at).format("l LT")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-default-400 py-2">{t("no comments yet")}</p>
              )}

              <div className="flex items-center gap-2">
                <Input
                  size="sm"
                  radius="full"
                  placeholder={t("write a comment")}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendComment()}
                />
                <Button
                  size="sm"
                  color="primary"
                  radius="full"
                  isLoading={sending}
                  isDisabled={!draft.trim()}
                  onPress={sendComment}
                >
                  {t("send")}
                </Button>
              </div>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    </>
  );
}
