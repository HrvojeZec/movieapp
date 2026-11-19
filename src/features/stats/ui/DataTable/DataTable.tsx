import { Table, Text } from "@mantine/core";
import classes from "./DataTable.module.scss";

interface DataTableProps {
  /** Names the table for screen readers; the widget title is the visible one. */
  label: string;
  columns: string[];
  /** The first cell of each row heads it. */
  rows: (string | number)[][];
  /** Shown instead of an empty table. */
  emptyText: string;
}

/** A widget's data as a plain table; the header stays put while the rows scroll. */
export function DataTable({ label, columns, rows, emptyText }: DataTableProps) {
  if (rows.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        {emptyText}
      </Text>
    );
  }
  return (
    <div className={classes.scroll}>
      <Table stickyHeader highlightOnHover verticalSpacing={6} aria-label={label}>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column, index) => (
              <Table.Th key={column} ta={index === 0 ? "left" : "right"}>
                {column}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map(([head, ...cells]) => (
            <Table.Tr key={String(head)}>
              <Table.Th scope="row" fw={500} c="gray.3">
                {head}
              </Table.Th>
              {cells.map((cell, index) => (
                <Table.Td key={columns[index + 1]} ta="right" className={classes.number}>
                  {cell}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
