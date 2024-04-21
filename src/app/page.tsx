"use client"

import {useQueryOptions} from "@/app/providers/query-options"
import {Button, Container, Stack, TextField, Typography} from "@mui/material"
import {useMutation, useQuery} from "@tanstack/react-query"

export default function Home() {
  const queryOptions = useQueryOptions()
  const scan = useMutation(queryOptions.scanGithubRepositories())

  return (
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
        <Container maxWidth={"sm"}>
          <Typography variant="h2" gutterBottom>
            Perform a new scan
          </Typography>
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
    </Stack>
  )
}
