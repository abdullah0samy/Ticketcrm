import React, { useState } from "react";
import { Pagination, Button } from "@nextui-org/react";

import { archived_columns } from "../../utils/data";
import MyTable from "../ui/MyTable";
import ArchivedTicketsRow from "./rows/ArchivedTicketsRow";
import TableTopContent from "../common/TableTopContent";
import { useDispatch, useSelector } from "react-redux";
import { restoreArchived } from "../../redux/actions/archiveActions";
import { toast } from "sonner";
import { t } from "i18next";
import useParamsQuery from "../../hooks/useParamsQuery";

export default function ArchivedTicketsTable() {
  const dispatch = useDispatch();
  const {
    data: { results, count },
    isLoading,
    error,
  } = useSelector((state) => state.archive);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const onSelectionChange = (value) => {
    if (value.includes("all")) {
      setSelectedKeys(results.map((el) => el.id));
    } else {
      setSelectedKeys(value);
    }
  };

  const handleRestore = async (ticket) => {
    try {
      await dispatch(restoreArchived({ ticket })).unwrap();
      toast.success(t("restore ticket success"));
    } catch (error) {
      toast.error(error);
    }
  };

  const rowMapping = results.map((ticket) => {
    return (
      <ArchivedTicketsRow
        key={ticket.id}
        rowId={ticket.id}
        ticketData={ticket}
        handleRestore={handleRestore}
      />
    );
  });

  return (
    <MyTable
      classNames={{
        container: " h-[65vh]",
      }}
      onSelectionChange={onSelectionChange}
      selectedKeys={selectedKeys}
      showCheckbox={true}
      topContent={<TableTopContent count={count} />}
      isLoading={isLoading}
      error={error}
      isEmpty={!results.length}
      bottomContent={
        <BottomContent
          selected={selectedKeys}
          count={count}
          handleRestore={handleRestore}
        />
      }
    >
      <MyTable.Head>
        {archived_columns.map((col) => (
          <MyTable.Col className={col.className} key={col.key}>
            {t(col.label)}
          </MyTable.Col>
        ))}
      </MyTable.Head>
      <MyTable.Body>{rowMapping}</MyTable.Body>
    </MyTable>
  );
}

function BottomContent({ selected = [], handleRestore, count }) {
  const { params, addParam } = useParamsQuery();
  const { page = 1, size = 10 } = params;
  return (
    <div className="bg-white border-t p-3 flex w-full items-center justify-between">
      <p className="text-base capitalize">
        {t("selected")} {selected.length} {t("tickets")}
      </p>
      {selected.length ? (
        <Button
          color="success"
          variant="flat"
          onClick={() => handleRestore(selected)}
        >
          {t("restore selected")}
        </Button>
      ) : null}
      <Pagination
        isCompact
        showControls
        showShadow
        color="secondary"
        page={+page}
        onChange={(page) => addParam({ page })}
        total={count ? Math.ceil(count / size) : 1}
      />
    </div>
  );
}
