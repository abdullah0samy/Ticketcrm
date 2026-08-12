import { Card, Checkbox, cn } from "@nextui-org/react";
import React, { Children, cloneElement, isValidElement } from "react";
import HandleError from "../common/HandleError";

/**
 * Table shell used by every ticket screen.
 *
 * On phones a 10-column table is unreadable, so below `md` each row is
 * restyled as a stacked card and every cell is prefixed with its column
 * name. The labels are read off <Head> here and handed down to the cells,
 * which means no page has to repeat its column names to get the mobile
 * layout — see `.table-responsive` in index.css for the presentation half.
 */
function collectLabels(children) {
  const head = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === Head
  );
  if (!head) return [];
  return Children.toArray(head.props.children).map((col) => {
    if (!isValidElement(col)) return "";
    const label = col.props.children;
    return typeof label === "string" || typeof label === "number" ? String(label) : "";
  });
}

function MyTable({
  classNames = {},
  topContent,
  bottomContent,
  showCheckbox,
  selectedKeys = [],
  onSelectionChange,
  children,
  isLoading,
  error,
  isEmpty,
  ...restProps
}) {
  const columnLabels = collectLabels(children);

  const cloneElements = Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child, {
          showCheckbox,
          selectedKeys,
          onSelectionChange,
          columnLabels,
        })
      : child
  );

  return (
    <Card className={classNames.card} shadow="sm" radius="sm">
      {topContent}
      <div className={cn("table-container", classNames.container)}>
        <HandleError isLoading={isLoading} error={error} isEmpty={isEmpty}>
          <table className={cn("table table-responsive", classNames.table)} {...restProps}>
            {cloneElements}
          </table>
        </HandleError>
      </div>
      {bottomContent}
    </Card>
  );
}

function Head({
  children,
  showCheckbox,
  selectedKeys,
  onSelectionChange,
  columnLabels,
  ...restProps
}) {
  return (
    <thead className="table-head" {...restProps}>
      <tr>
        {showCheckbox ? (
          <th className="table-col">
            <Checkbox
              aria-label="select all"
              onValueChange={(value) => onSelectionChange(value ? ["all"] : [])}
            />
          </th>
        ) : null}
        {children}
      </tr>
    </thead>
  );
}

function Col({ className, children, ...restProps }) {
  return (
    <th className={cn("table-col", className)} {...restProps}>
      {children}
    </th>
  );
}

function Body({
  showCheckbox,
  selectedKeys,
  onSelectionChange,
  columnLabels,
  children,
  ...restProps
}) {
  const cloneElements = Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child, {
          showCheckbox,
          selectedKeys,
          onSelectionChange,
          columnLabels,
        })
      : child
  );

  return (
    <tbody className="table-body" {...restProps}>
      {cloneElements}
    </tbody>
  );
}

function Row({
  showCheckbox,
  selectedKeys,
  onSelectionChange,
  columnLabels = [],
  rowId,
  children,
  ...restProps
}) {
  const selected = showCheckbox ? selectedKeys.includes(rowId) : null;

  const handleChange = () => {
    if (selected) {
      onSelectionChange(selectedKeys.filter((item) => item !== rowId));
    } else {
      onSelectionChange([...selectedKeys, rowId]);
    }
  };

  // Stamp each cell with its column name so the stacked mobile layout can
  // show it. The checkbox column has no label and is skipped.
  const labelledCells = Children.map(children, (child, index) =>
    isValidElement(child)
      ? cloneElement(child, { "data-label": columnLabels[index] || "" })
      : child
  );

  return (
    <tr
      className={`table-row ${selected ? "active" : ""}`}
      onClick={showCheckbox ? handleChange : null}
      {...restProps}
    >
      {showCheckbox ? (
        <Cell className="table-cell-checkbox">
          <Checkbox
            aria-label="select row"
            isSelected={selected}
            onValueChange={handleChange}
            value={rowId}
          />
        </Cell>
      ) : null}

      {labelledCells}
    </tr>
  );
}

function Cell({ className, children, ...restProps }) {
  return (
    <td className={cn("table-cell", className)} {...restProps}>
      {children}
    </td>
  );
}

export default Object.assign(MyTable, {
  Head,
  Col,
  Body,
  Row,
  Cell,
});
