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
import Link from "next/link"

export default function RepositoryPage({
  params,
}: {params: {repositoryId: string}}) {
  const queryOptions = useQueryOptions()
  const summary = useQuery(
    queryOptions.getRepositorySummary(params.repositoryId),
  )
  const scans = useQuery(queryOptions.getRepositoryScans(params.repositoryId))

  return (
    <Stack spacing={2}>
      <Typography variant="h2" gutterBottom>
        Scans for {summary.isSuccess && summary.data.name}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Scanned At</TableCell>
              <TableCell>Permissive</TableCell>
              <TableCell>Weak Copyleft</TableCell>
              <TableCell>Copyleft</TableCell>
              <TableCell>Non-Commercial</TableCell>
              <TableCell>Unclassified</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!scans.isPending &&
              !scans.isError &&
              scans.data.map((scan) => (
                <TableRow key={scan.scanId}>
                  <TableCell>
                    <Link
                      href={`/repositories/${scan.repositoryId}/scans/${scan.scanId}`}
                    >
                      {scan.scannedAt}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {scan.summary.groups.find((it) => it.name === "Permissive")
                      ?.count || 0}
                  </TableCell>
                  <TableCell>
                    {scan.summary.groups.find(
                      (it) => it.name === "Weak Copyleft",
                    )?.count || 0}
                  </TableCell>
                  <TableCell>
                    {scan.summary.groups.find((it) => it.name === "Copyleft")
                      ?.count || 0}
                  </TableCell>
                  <TableCell>
                    {scan.summary.groups.find(
                      (it) => it.name === "Non-Commercial",
                    )?.count || 0}
                  </TableCell>
                  <TableCell>
                    {scan.summary.groups.find(
                      (it) => it.name === "Unclassified",
                    )?.count || 0}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
