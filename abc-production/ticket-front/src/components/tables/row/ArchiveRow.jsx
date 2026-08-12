import React from "react";
import { Button, Form, Stack } from "react-bootstrap";
import { ArrowPath } from "../../Icons";
import { useDispatch } from "react-redux";
import { restoreArchived } from "./../../../store/Slice/archiveSlice";
import moment from "moment/moment";
import UserAvatar from "../../elements/UserAvatar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { t } from "i18next";

function ArchiveRow({ archiveData, isChecked, handleClick }) {
  const {
    id,
    building,
    complaint,
    floor,
    extension,
    status,
    department,
    created_at,
  } = archiveData;
  const dispatch = useDispatch();

  const handelRestore = async () => {
    try {
      const res = await Swal.fire({
        title: t("swal title"),
        showCancelButton: true,
        icon: "info",
        confirmButtonText: t("yes"),
        cancelButtonText: t("cancel"),
        confirmButtonColor: "#198754",
        cancelButtonColor: "#dc3545",
      });
      if (res.isConfirmed) {
        await dispatch(restoreArchived([id])).unwrap();
        toast.success(t("restore ticket success"), {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  return (
    <tr>
      <td>{id}</td>
      <td>
        <Form.Check
          value={id}
          id={id}
          type="checkbox"
          checked={isChecked.includes(id)}
          onChange={handleClick}
        />
      </td>
      <td className="user">
        <UserAvatar
          img={complaint.image}
          name={complaint.name}
          subTitle={complaint.department}
        />
      </td>
      <td>{department.name}</td>
      <td className="building">{t(building)}</td>
      <td className="floor">{t(floor)}</td>
      <td>{extension}</td>
      <td>
        <span
          className={`badge ${
            status === "on hold"
              ? "bg-danger"
              : status === "complete"
              ? "bg-success"
              : "bg-warning"
          }  p-2`}
        >
          {t(status)}
        </span>
      </td>
      <td className="date">{moment(created_at).format("l LT")}</td>
      <td className="action">
        <Stack direction="horizontal" gap={1}>
          <Button variant="success" size="sm" onClick={handelRestore}>
            <ArrowPath />
          </Button>
        </Stack>
      </td>
    </tr>
  );
}

export default ArchiveRow;
