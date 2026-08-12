import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { t } from "i18next";
import i18next from "i18next";
import {
  Button, Card, Chip, Input, Modal, ModalBody, ModalContent, ModalHeader,
  Spinner,
} from "@nextui-org/react";
import { HiOutlineArrowLeft, HiOutlineBookOpen, HiOutlineEye, HiOutlineSearch } from "react-icons/hi";

/** Bilingual knowledge base: category sidebar, search, article reader. */
export default function KnowledgePage() {
  const isAr = i18next.language?.startsWith("ar");
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/catalog/knowledge-articles/", {
        params: {
          search: search || undefined,
          category: activeCategory || undefined,
        },
      });
      setArticles(res?.results ?? res ?? []);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    const id = setTimeout(loadArticles, search ? 300 : 0);
    return () => clearTimeout(id);
  }, [loadArticles, search]);

  useEffect(() => {
    axios
      .get("/catalog/knowledge-categories/")
      .then((res) => setCategories(res?.results ?? res ?? []))
      .catch(() => {});
  }, []);

  const openArticle = async (article) => {
    setOpen(article);
    // fire-and-forget view counter
    axios.post(`/catalog/knowledge-articles/${article.id}/view/`).catch(() => {});
  };

  const title = useMemo(
    () => (a) => (isAr ? a.title_ar : a.title_en),
    [isAr]
  );
  const content = (a) => (isAr ? a.content_ar : a.content_en);
  const catName = (c) => (isAr ? c.name_ar : c.name_en);

  return (
    <div className="py-4">
      {/* hero search */}
      <Card radius="sm" shadow="sm" className="p-6 mb-4 bg-primary text-white">
        <h1 className="text-xl font-bold capitalize mb-1">{t("knowledge base")}</h1>
        <p className="text-sm opacity-90 mb-4">
          {t("search for solutions before opening a ticket")}
        </p>
        <Input
          size="lg"
          radius="sm"
          placeholder={t("search articles")}
          startContent={<HiOutlineSearch className="text-default-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          isClearable
          onClear={() => setSearch("")}
          classNames={{ inputWrapper: "bg-white" }}
        />
      </Card>

      <div className="grid gap-3 lg:grid-cols-4">
        {/* categories */}
        <Card radius="sm" shadow="sm" className="p-3 h-fit">
          <h2 className="font-semibold capitalize mb-2 text-sm">{t("categories")}</h2>
          <ul className="space-y-1">
            <li>
              <button
                className={`w-full text-start px-3 py-2 rounded-lg text-sm transition ${
                  !activeCategory ? "bg-primary text-white" : "hover:bg-default-100"
                }`}
                onClick={() => setActiveCategory(null)}
              >
                {t("all")}
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                    activeCategory === c.id ? "bg-primary text-white" : "hover:bg-default-100"
                  }`}
                  onClick={() => setActiveCategory(c.id)}
                >
                  <span className="truncate">{catName(c)}</span>
                  <Chip size="sm" variant="flat">
                    {c.articles_count}
                  </Chip>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* articles */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-16 box-center">
              <Spinner />
            </div>
          ) : articles.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {articles.map((a) => (
                <Card
                  key={a.id}
                  radius="sm"
                  shadow="sm"
                  isPressable
                  className="p-4 text-start"
                  onPress={() => openArticle(a)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl text-primary shrink-0">
                      <HiOutlineBookOpen />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{title(a)}</h3>
                      <p className="text-xs text-default-500 line-clamp-2 mt-1">
                        {content(a)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Chip size="sm" variant="flat">
                          {a.category_name}
                        </Chip>
                        <span className="text-[11px] text-default-400 flex items-center gap-1">
                          <HiOutlineEye /> {a.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card radius="sm" shadow="sm" className="py-16 text-center text-default-400">
              {t("no articles found")}
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={Boolean(open)} onOpenChange={() => setOpen(null)} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex-col items-start gap-1">
            <span>{open ? title(open) : ""}</span>
            <Chip size="sm" variant="flat">
              {open?.category_name}
            </Chip>
          </ModalHeader>
          <ModalBody className="pb-6">
            <p className="whitespace-pre-wrap leading-relaxed">{open ? content(open) : ""}</p>
            <Button
              className="mt-4 self-start"
              variant="flat"
              startContent={<HiOutlineArrowLeft className="rtl:rotate-180" />}
              onPress={() => setOpen(null)}
            >
              {t("back")}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
