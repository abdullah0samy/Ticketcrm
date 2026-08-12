import { Card, Checkbox, cn } from "@nextui-org/react";
import React, { Children, cloneElement } from "react";
import HandleError from "../common/HandleError";

function MyTable({
  classNames={},
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
  const cloneElements = Children.map(children, (child) => {
    return cloneElement(child, {
      showCheckbox,
      selectedKeys,
      onSelectionChange,
    });
  });

  return (
    <Card className={classNames.card} shadow="sm" radius="sm">
      {topContent}
      <div className={cn("table-container",classNames.container) }>
        <HandleError isLoading={isLoading} error={error} isEmpty={isEmpty}>
          <table className={cn("table", classNames.table)} {...restProps}>
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
  ...restProps
}) {
  return (
    <thead className="table-head" {...restProps}>
      <tr>
        {showCheckbox ? (
          <th className="table-col">
            <Checkbox
              onValueChange={(value) => {
                if (value) {
                  onSelectionChange(["all"]);
                } else {
                  onSelectionChange([]);
                }
              }}
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
  children,
  ...restProps
}) {
  const cloneElements = Children.map(children, (child) => {
    return cloneElement(child, {
      showCheckbox,
      selectedKeys,
      onSelectionChange,
    });
  });

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

  return (
    <tr
      className={`table-row ${selected ? "active" : ""}`}
      onClick={showCheckbox ? handleChange : null}
      {...restProps}
    >
      {showCheckbox ? (
        <Cell>
          <Checkbox
            isSelected={selected}
            onValueChange={handleChange}
            value={rowId}
          />
        </Cell>
      ) : null}

      {children}
    </tr>
  );
}

function Cell({ children, ...restProps }) {
  return (
    <td className="table-cell" {...restProps}>
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
