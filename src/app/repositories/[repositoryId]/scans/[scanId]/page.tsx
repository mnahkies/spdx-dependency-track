"use client"

import {useQueryOptions} from "@/app/providers/query-options"
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import {useQuery} from "@tanstack/react-query"

export default function RepositoryScanPage({
  params,
}: {params: {repositoryId: string; scanId: string}}) {
  const queryOptions = useQueryOptions()
  const summary = useQuery(
    queryOptions.getRepositorySummary(params.repositoryId),
  )
  const dependencies = useQuery(
    queryOptions.getRepositoryScanDependencies(
      params.repositoryId,
      params.scanId,
    ),
  )

  return (
    <Stack>
      <Typography variant="h2" gutterBottom>
        Scan for {summary.isSuccess && summary.data.name}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>License Concluded</TableCell>
              <TableCell>Risk</TableCell>
              <TableCell>License Declared</TableCell>
              <TableCell>Risk</TableCell>
              <TableCell>Supplier</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!dependencies.isPending &&
              !dependencies.isError &&
              dependencies.data.map((dependency) => (
                <TableRow
                  key={dependency.dependencyName + dependency.dependencyVersion}
                >
                  <TableCell>{dependency.dependencyName}</TableCell>
                  <TableCell>{dependency.dependencyVersion}</TableCell>
                  <TableCell>
                    {dependency.licenseConcludedName || "-"}
                  </TableCell>
                  <TableCell>
                    {dependency.licenseConcludedCategory || "-"}
                  </TableCell>
                  <TableCell>
                    {" "}
                    {dependency.licenseDeclaredName || "-"}
                  </TableCell>
                  <TableCell>
                    {dependency.licenseDeclaredCategory || "-"}
                  </TableCell>
                  <TableCell>{dependency.supplier}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
