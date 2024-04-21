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

export default function RepositoryListPage({}: {}) {
  const queryOptions = useQueryOptions()
  const summaries = useQuery(queryOptions.getRepositorySummaries())

  return (
    <Stack spacing={2}>
      <Typography variant="h2" gutterBottom>
        Latest Scan Summary
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Repository</TableCell>
              <TableCell>Permissive</TableCell>
              <TableCell>Weak Copyleft</TableCell>
              <TableCell>Copyleft</TableCell>
              <TableCell>Non-Commercial</TableCell>
              <TableCell>Unclassified</TableCell>
              <TableCell>Unknown</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!summaries.isPending &&
              !summaries.isError &&
              summaries.data.map((summary) => (
                <TableRow key={summary.name}>
                  <TableCell>
                    <Link href={`/repositories/${summary.repositoryId}`}>
                      {summary.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {summary.groups.find((it) => it.name === "Permissive")
                      ?.count || 0}
                  </TableCell>
                  <TableCell>
                    {summary.groups.find((it) => it.name === "Weak Copyleft")
                      ?.count || 0}
                  </TableCell>
                  <TableCell>
                    {summary.groups.find((it) => it.name === "Copyleft")
                      ?.count || 0}
                  </TableCell>
                  <TableCell>
                    {summary.groups.find((it) => it.name === "Non-Commercial")
                      ?.count || 0}
                  </TableCell>
                  <TableCell>
                    {summary.groups.find((it) => it.name === "Unclassified")
                      ?.count || 0}
                  </TableCell>
                  <TableCell>
                    {summary.groups.find((it) => it.name === "Unknown")
                      ?.count || 0}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
