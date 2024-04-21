"use client"

import {useQueryOptions} from "@/app/providers/query-options"
import {
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import {useMutation, useQuery} from "@tanstack/react-query"

export default function Home() {
  const queryOptions = useQueryOptions()

  const licenses = useQuery(queryOptions.getLicenses())
  const summaries = useQuery(queryOptions.getRepositorySummaries())
  const scan = useMutation(queryOptions.scanGithubRepositories())

  return (
    <Container maxWidth="xl">
      <Stack spacing={4}>
        <form
          action={async (formData) => {
            const token = formData.get("api-token")

            if (!token || typeof token !== "string") {
              return
            }

            scan.mutate({token})
          }}
        >
          <Typography variant="h2" gutterBottom>
            Perform a new scan
          </Typography>
          <Container maxWidth={"sm"}>
            <Stack spacing={2}>
              <TextField
                required
                id="api-token"
                name="api-token"
                label="Github API Token / PAT"
                placeholder="github_pat_yaGezeB98IUKoSwnJjk5HbudiCgoRvrz"
                variant="filled"
              />
              <Button type={"submit"} variant="contained">
                Scan
              </Button>
            </Stack>
          </Container>
        </form>

        {!summaries.isPending && !summaries.isError && (
          <Stack spacing={2}>
            {" "}
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaries.data.map((summary) => (
                    <TableRow key={summary.name}>
                      <TableCell>{summary.name}</TableCell>
                      <TableCell>
                        {summary.groups.find((it) => it.name === "Permissive")
                          ?.count || 0}
                      </TableCell>
                      <TableCell>
                        {summary.groups.find(
                          (it) => it.name === "Weak Copyleft",
                        )?.count || 0}
                      </TableCell>
                      <TableCell>
                        {summary.groups.find((it) => it.name === "Copyleft")
                          ?.count || 0}
                      </TableCell>
                      <TableCell>
                        {summary.groups.find(
                          (it) => it.name === "Non-Commercial",
                        )?.count || 0}
                      </TableCell>
                      <TableCell>
                        {summary.groups.find((it) => it.name === "unclassified")
                          ?.count || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}

        {!licenses.isPending && !licenses.isError && (
          <Stack spacing={2}>
            <Typography variant="h2" gutterBottom>
              Known Licenses
            </Typography>
            <List dense={true}>
              {licenses.data.map((it) => {
                return (
                  <ListItem key={it.external_id}>
                    <ListItemText primary={it.name} secondary={it.group_name} />
                  </ListItem>
                )
              })}
            </List>
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
