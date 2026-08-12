import React, { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger, Button } from "@nextui-org/react";
import { HiOutlineFaceSmile } from "react-icons/hi2";
import { t } from "i18next";

/**
 * A small emoji picker with no dependency.
 *
 * The alternative was pulling in emoji-mart, which ships a multi-megabyte
 * dataset and fetches sheets from a CDN — neither is acceptable for a hospital
 * intranet that may be offline. This covers the set people actually reach for
 * in a support conversation.
 */
const GROUPS = [
  {
    key: "recent",
    icon: "🙂",
    emojis: ["👍", "🙏", "✅", "❌", "⚠️", "🔥", "👀", "🎉", "❤️", "😂", "🤝", "💯"],
  },
  {
    key: "faces",
    icon: "😀",
    emojis: [
      "😀", "😁", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "😘", "😋", "😎",
      "🤓", "🧐", "🤔", "🤨", "😐", "😑", "😴", "😪", "😮", "😲", "😳", "🥺",
      "😢", "😭", "😤", "😠", "😡", "🤯", "😱", "😰", "🥵", "🥶", "🤒", "🤕",
      "🤢", "🤮", "🤧", "😷", "🤠", "🥳", "😬", "🙃", "😅", "😆", "😌", "😔",
    ],
  },
  {
    key: "gestures",
    icon: "👍",
    emojis: [
      "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤙", "👈", "👉", "👆", "👇", "☝️",
      "✋", "🤚", "🖐️", "🖖", "👋", "🤝", "🙏", "💪", "🦾", "✍️", "👏", "🙌",
      "🤲", "🫡", "🫶", "👊", "✊", "🤛", "🤜", "💅",
    ],
  },
  {
    key: "objects",
    icon: "💡",
    emojis: [
      "💡", "🔧", "🔨", "🛠️", "⚙️", "🧰", "🔌", "🔋", "💻", "🖥️", "⌨️", "🖨️",
      "🖱️", "📱", "☎️", "📞", "📟", "📠", "🗂️", "📁", "📄", "📋", "📌", "📍",
      "🔑", "🔒", "🔓", "🧾", "💾", "💿", "📷", "🎥", "🔦", "🪛", "🧯", "🚪",
      "🩺", "💊", "💉", "🩹", "🧪", "🧫", "🦠", "🏥", "🚑", "🛏️", "🧴", "🧼",
    ],
  },
  {
    key: "symbols",
    icon: "✅",
    emojis: [
      "✅", "❌", "⭕", "❗", "❓", "⚠️", "🚫", "🔴", "🟠", "🟡", "🟢", "🔵",
      "⚫", "⚪", "🔺", "🔻", "⭐", "🌟", "💯", "🔥", "💥", "✨", "🎉", "🎯",
      "⏰", "⏳", "📅", "📈", "📉", "📊", "❤️", "🧡", "💛", "💚", "💙", "💜",
    ],
  },
];

export default function EmojiPicker({ onPick, isDisabled = false }) {
  const [group, setGroup] = useState(GROUPS[0].key);

  const emojis = useMemo(
    () => GROUPS.find((g) => g.key === group)?.emojis ?? [],
    [group]
  );

  return (
    <Popover placement="top" showArrow>
      <PopoverTrigger>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          radius="full"
          isDisabled={isDisabled}
          aria-label={t("emoji")}
          className="text-default-500"
        >
          <HiOutlineFaceSmile className="text-xl" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="w-[17rem] sm:w-[20rem]">
          <div className="flex items-center gap-1 border-b border-default-200 p-1.5">
            {GROUPS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGroup(g.key)}
                className={[
                  "flex-1 rounded-md py-1 text-lg transition-colors",
                  group === g.key ? "bg-primary-100" : "hover:bg-default-100",
                ].join(" ")}
                aria-label={g.key}
              >
                {g.icon}
              </button>
            ))}
          </div>
          <div className="grid max-h-52 grid-cols-8 gap-0.5 overflow-y-auto p-2">
            {emojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                type="button"
                onClick={() => onPick(emoji)}
                className="rounded-md p-1 text-xl leading-none transition-transform hover:scale-125 hover:bg-default-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
