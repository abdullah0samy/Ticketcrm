/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Form, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getArchives } from "./../../store/Slice/archiveSlice";
import ArchiveRow from "./row/ArchiveRow";
import HandelError from "../elements/HandelError";

function ArchiveTable({ isCheck, setIsCheck }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isCheckAll, setIsCheckAll] = useState(false);

  const { archiveList, loading, error } = useSelector((state) => state.archive);

  let [searchParams] = useSearchParams();
  const params = Object.fromEntries([...searchParams]);

  useEffect(() => {
    dispatch(getArchives(params));
    setIsCheck([]);
  }, [searchParams]);


  const handleSelectAll = (e) => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(archiveList.map((li) => li.id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };



  const handleClick = (e) => {
    const { id, checked } = e.target;
    if (checked) {
      setIsCheck([...isCheck, +id]);
    } else {
      setIsCheck(isCheck.filter((item) => item !== +id));
    }
  };

  const archiveMapping = archiveList.map((archived) => {
    return (
      <ArchiveRow
        archiveData={archived}
        key={archived.id}
        handleClick={handleClick}
        isChecked={isCheck}
      />
    );
  });

  return (
    <>
      <Table className="align-middle custom-table bg-white" hover responsive>
        <thead>
          <tr>
            <th className="py-3">#</th>
            <th className="py-3">
              <Form.Check
                type="checkbox"
                onChange={handleSelectAll}
                checked={archiveList.length === isCheck.length}
              />
            </th>
            <th className="py-3">{t("user")}</th>
            <th className="py-3">{t("department")}</th>
            <th className="py-3">{t("building")}</th>
            <th className="py-3">{t("floor")}</th>
            <th className="py-3">{t("extension")}</th>
            <th className="py-3">{t("status")}</th>
            <th className="py-3">{t("date")}</th>
            <th className="py-3">{t("action")}</th>
          </tr>
        </thead>
        <tbody>{archiveMapping}</tbody>
      </Table>
      <HandelError loading={loading} error={error} dataList={archiveList} />
    </>
  );
}

export default ArchiveTable;
