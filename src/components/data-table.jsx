import {
  ScrollShadow,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';

function DataTable({
  columns,
  items,
  renderCell,
  isLoading = false,
  emptyContent = 'Tidak ada data',
}) {
  return (
    <ScrollShadow className="h-full w-full overflow-auto" hideScrollBar>
      <Table
        aria-label="Data table"
        isHeaderSticky
        isStriped
        removeWrapper
        classNames={{
          base: 'h-full max-h-full w-full overflow-auto',
          table: 'min-h-[100px] min-w-[920px]',
          th: 'bg-gray-100 text-primary-700 whitespace-nowrap',
        }}
      >
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key} className="whitespace-nowrap">{column.header}</TableColumn>}
        </TableHeader>
        <TableBody
          items={items}
          isLoading={isLoading}
          emptyContent={<div className="p-6 text-center text-sm">{emptyContent}</div>}
          loadingContent={<Spinner color="primary" label="Loading..." />}
        >
          {(item) => (
            <TableRow key={item.rowKey || item.id}>
              {(columnKey) => (
                <TableCell className="whitespace-nowrap">
                  {renderCell ? renderCell(item, String(columnKey)) : item[columnKey]}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollShadow>
  );
}

export { DataTable };
