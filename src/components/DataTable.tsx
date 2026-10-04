import {
  Box,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Esconde a coluna em telas menores que o breakpoint informado. */
  hideBelow?: "sm" | "md" | "lg";
  isNumeric?: boolean;
  width?: string;
};

type DataTableProps<T> = {
  /** Nome acessível da tabela (lido por leitores de tela). */
  label: string;
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  emptyState?: ReactNode;
};

const SKELETON_ROWS = 4;

function responsiveDisplay(hideBelow?: "sm" | "md" | "lg") {
  return hideBelow ? { base: "none", [hideBelow]: "table-cell" } : undefined;
}

export function DataTable<T>({
  label,
  columns,
  rows,
  getRowId,
  isLoading = false,
  emptyState,
}: DataTableProps<T>) {
  if (!isLoading && rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <Box
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.subtle"
      rounded="xl"
      overflow="hidden"
      shadow="sm"
    >
      <TableContainer>
        <Table
          aria-label={label}
          sx={{
            "th, td": {
              borderColor: "border.subtle",
              // No celular: menos espaço lateral e texto quebrando linha,
              // para a coluna de ações caber sem rolagem horizontal.
              px: { base: 3, md: 6 },
              whiteSpace: { base: "normal", md: "nowrap" },
            },
            "tbody tr:last-of-type td": { borderBottomWidth: 0 },
          }}
        >
          <Thead bg="bg.subtle">
            <Tr>
              {columns.map((column) => (
                <Th
                  key={column.key}
                  isNumeric={column.isNumeric}
                  display={responsiveDisplay(column.hideBelow)}
                  w={column.width}
                >
                  {column.header}
                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  <Tr key={index}>
                    {columns.map((column) => (
                      <Td
                        key={column.key}
                        display={responsiveDisplay(column.hideBelow)}
                      >
                        <Skeleton h="4" rounded="md" />
                      </Td>
                    ))}
                  </Tr>
                ))
              : rows.map((row) => (
                  <Tr
                    key={getRowId(row)}
                    transition="background 0.15s"
                    _hover={{ bg: "bg.subtle" }}
                  >
                    {columns.map((column) => (
                      <Td
                        key={column.key}
                        isNumeric={column.isNumeric}
                        display={responsiveDisplay(column.hideBelow)}
                      >
                        {column.cell(row)}
                      </Td>
                    ))}
                  </Tr>
                ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
