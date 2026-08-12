import React, { useEffect, useState } from "react";
import FileCard from "../../components/cards/FileCard";
import ExportsFileModal from "../../components/modals/ExportsFileModal";
import { Button, useDisclosure } from "@nextui-org/react";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { t } from "i18next";
import { useDispatch, useSelector } from "react-redux";
import { getExports, getMoreExports } from "../../redux/actions/exportActions";
import HandleError from "../../components/common/HandleError";
import useGetOptions from "../../hooks/useGetOptions";
import Select from "react-select";
import CanView from "../../components/common/CanView";
import LoadMoreData from "../../components/common/LoadMoreData";

export default function ExportsPage() {
  const dispatch = useDispatch();
  const [department, setSepartment] = useState();
  const {
    data: { results, next },
    exportStatus,
    isLoading,
    error,
  } = useSelector((state) => state.exports);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const selectDepart = useGetOptions(
    "/users/router/department/select/?reciever=true"
  );

  useEffect(() => {
    dispatch(getExports({ department }));
  }, [dispatch, department]);

  const fileMapping = results.map((file) => {
    return <FileCard fileData={file} key={file.id} />;
  });

  return (
    <>
      <ExportsFileModal isOpen={isOpen} onClose={() => onOpenChange(false)} />
      <div className="page-header pt-4">
        <div>
          <h1 className="page-title">{t("view files exports")}</h1>
          <p className="page-subtitle">{t("generated ticket exports")}</p>
        </div>

        {/* wraps under the title on a phone instead of being squeezed beside it */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <CanView allowed={["administration"]}>
            <Select
              options={selectDepart.options}
              isLoading={selectDepart.isLoading}
              onMenuOpen={selectDepart.getOptions}
              placeholder={t("select department")}
              className="h-full w-full sm:w-56"
              onChange={(option) => setSepartment(option.value)}
            />
          </CanView>
          <CanView allowed={["manager"]}>
            <Button
              radius="md"
              color="primary"
              onClick={onOpen}
              endContent={<HiOutlineDocumentDownload className="text-xl" />}
              isLoading={exportStatus === 1}
            >
              {exportStatus === 1 ? t("exporting") : t("export")}
            </Button>
          </CanView>
        </div>
      </div>
      <HandleError
        isLoading={isLoading}
        error={error}
        isEmpty={!results.length}
      >
        <div className="grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {fileMapping}
        </div>
        <LoadMoreData next={next} dispatchFn={() => getMoreExports(next)} />
      </HandleError>
    </>
  );
}
