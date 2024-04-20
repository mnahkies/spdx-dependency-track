"use client"

import {t_License, t_RepositorySummary} from "@/generated/models"
import {useEagerPromise} from "@/lib/utils/usePromise"
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

export default function Home() {
  const licenses = useEagerPromise<t_License[]>(async () => {
    const res = await fetch(`http://localhost:3000/api/licenses`)
    return await res.json()
  })

  const summaries = useEagerPromise<t_RepositorySummary[]>(async () => {
    const res = await fetch(`http://localhost:3000/api/repositories/summaries`)
    return await res.json()
  })

  return (
    <Container maxWidth="xl">
      <Stack spacing={4}>
        <form
          action={async (formData) => {
            await fetch(`http://localhost:3000/api/repositories/scan`, {
              method: "post",
              body: JSON.stringify({token: formData.get("api-token")}),
            })
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

        {!summaries.loading && !summaries.err && (
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

        {!licenses.loading && !licenses.err && (
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
