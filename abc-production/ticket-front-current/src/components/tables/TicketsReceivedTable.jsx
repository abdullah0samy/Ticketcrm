import React, { useState } from "react";
import { Pagination, Button, useDisclosure } from "@nextui-org/react";
import { received_columns } from "../../utils/data";
import TicketsReceivedRow from "./rows/TicketsReceivedRow";
import { useDispatch, useSelector } from "react-redux";
import { archiveTickets } from "../../redux/actions/ticketActions";
import MyTable from "../ui/MyTable";
import TableTopContent from "../common/TableTopContent";
import TransferModal from "../modals/TransferModal";
import { t } from "i18next";
import { toast } from "sonner";
import useParamsQuery from "./../../hooks/useParamsQuery";
import CanView from "../common/CanView";

export default function TicketsReceivedTable() {
  const dispatch = useDispatch();
  const {
    data: { results, count },
    isLoading,
    error,
  } = useSelector((state) => state.tickets);
  const { userData } = useSelector((state) => state.account);

  const [selectedKeys, setSelectedKeys] = useState([]);

  const onSelectionChange = (value) => {
    if (value.includes("all")) {
      setSelectedKeys(results.map((el) => el.id));
    } else {
      setSelectedKeys(value);
    }
  };

  const handleArchived = async (ticket) => {
    try {
      await dispatch(archiveTickets({ ticket })).unwrap();
      toast.success(t("deleted successfully"));
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <MyTable
        classNames={{
          container: "h-[65vh]",
        }}
        onSelectionChange={onSelectionChange}
        selectedKeys={selectedKeys}
        showCheckbox={userData.role === "manager"}
        isLoading={isLoading}
        error={error}
        isEmpty={!results.length}
        topContent={<TableTopContent count={count} />}
        bottomContent={
          <BottomContent
            selected={selectedKeys}
            count={count}
            handleArchived={handleArchived}
          />
        }
      >
        <MyTable.Head>
          {received_columns.map((col) => (
            <MyTable.Col className={col.className} key={col.key}>
              {t(col.label)}
            </MyTable.Col>
          ))}
        </MyTable.Head>
        <MyTable.Body>
          {results.map((ticket) => (
            <TicketsReceivedRow
              key={ticket.id}
              ticketData={ticket}
              handleArchived={handleArchived}
            />
          ))}
        </MyTable.Body>
      </MyTable>
    </>
  );
}

function BottomContent({ selected = [], count, handleArchived }) {
  const { isOpen, onOpenChange, onOpen } = useDisclosure();
  const { params, addParam } = useParamsQuery();
  const { page = 1, size = 10 } = params;
  return (
    <>
      {isOpen ? (
        <TransferModal
          isOpen={isOpen}
          onClose={() => onOpenChange(false)}
          ticketIds={selected}
        />
      ) : null}
      <div className="bg-white border-t p-3 flex w-full items-center justify-between">
        <p className="text-base capitalize">
          {t("selected")} {selected.length} {t("tickets")}
        </p>
        <CanView allowed={["manager"]}>
          {selected.length ? (
            <div className="flex items-center gap-2">
              <Button onClick={onOpen}>{t("transfer")}</Button>
              <Button color="danger" onClick={() => handleArchived(selected)}>
                {t("archive")}
              </Button>
            </div>
          ) : null}
        </CanView>

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
    </>
  );
}
