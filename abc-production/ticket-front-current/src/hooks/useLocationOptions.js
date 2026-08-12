import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

/**
 * Building and floor options taken from the catalog tables.
 *
 * These used to come from a hardcoded array in `utils/selectOptions.js`, so the
 * Buildings and Floors admin screens edited data that nothing ever read — a
 * building added there could never be picked on a ticket. Reading the same
 * tables the admin edits makes those screens actually mean something.
 *
 * The stored value stays the building/floor `code`, which is what the Ticket
 * model has always persisted, so existing tickets are unaffected.
 */
export default function useLocationOptions(selectedBuildingCode) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");

  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [loadingFloors, setLoadingFloors] = useState(false);

  const label = useCallback(
    (row) => (isArabic ? row.name_ar : row.name_en) || row.name_en || row.code,
    [isArabic]
  );

  useEffect(() => {
    let cancelled = false;
    setLoadingBuildings(true);
    axios
      .get("/catalog/buildings/")
      .then((res) => {
        if (cancelled) return;
        const rows = res?.results ?? res ?? [];
        setBuildings(rows.filter((b) => b.is_active !== false));
      })
      .catch(() => {
        if (!cancelled) setBuildings([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBuildings(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Floors are scoped to the chosen building, matching what the backend
  // accepts — picking a floor from another building is rejected on save.
  const buildingId = useMemo(
    () => buildings.find((b) => b.code === selectedBuildingCode)?.id,
    [buildings, selectedBuildingCode]
  );

  useEffect(() => {
    if (!buildingId) {
      setFloors([]);
      return undefined;
    }
    let cancelled = false;
    setLoadingFloors(true);
    axios
      .get(`/catalog/floors/?building=${buildingId}`)
      .then((res) => {
        if (cancelled) return;
        const rows = res?.results ?? res ?? [];
        setFloors(rows.filter((f) => f.is_active !== false));
      })
      .catch(() => {
        if (!cancelled) setFloors([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingFloors(false);
      });
    return () => {
      cancelled = true;
    };
  }, [buildingId]);

  return {
    buildingOptions: buildings.map((b) => ({ value: b.code, label: label(b) })),
    floorOptions: floors.map((f) => ({ value: f.code, label: label(f) })),
    loadingBuildings,
    loadingFloors,
  };
}
