import { useEffect, useState } from "react";
import axios from "axios";

/** Departments as `{ value, label }` for the admin form selects. */
export default function useDepartmentOptions() {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/catalog/departments/")
      .then((res) => {
        if (cancelled) return;
        const rows = res?.results ?? res ?? [];
        setOptions(rows.map((d) => ({ value: d.id, label: d.name })));
      })
      .catch(() => {
        /* the select simply stays empty — the page is still usable */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}
