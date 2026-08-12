import React from "react";
import { Pagination } from "@nextui-org/react";
import SentTicketsRow from "./rows/SentTicketsRow";
import MyTable from "../ui/MyTable";
import { sent_columns } from "../../utils/data";
import { useSelector } from "react-redux";
import TableTopContent from "../common/TableTopContent";
import useParamsQuery from "../../hooks/useParamsQuery";
import { t } from "i18next";

export default function SentTicketsTable() {
  const {
    data: { results, count },
    isLoading,
    error,
  } = useSelector((state) => state.tickets);



  const rowMapping = results.map((row) => (
    <SentTicketsRow
      key={row.id}
      ticketData={row}
    />
  ));

  return (
    <MyTable
      classNames={{
        container: " h-[65vh]",
      }}
      topContent={<TableTopContent count={count} />}
      bottomContent={<BottomContent count={count} />}
      isLoading={isLoading}
      error={error}
      isEmpty={!results.length}
    >
      <MyTable.Head>
        {sent_columns.map((col) => (
          <MyTable.Col className={col.className} key={col.key}>
            {t(col.label)}
          </MyTable.Col>
        ))}
      </MyTable.Head>
      <MyTable.Body>{rowMapping}</MyTable.Body>
    </MyTable>
  );
}

function BottomContent({ count }) {
  const { params, addParam } = useParamsQuery();
  const { page = 1, size = 10 } = params;

  return (
    <div className="p-3 flex w-full justify-center">
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
