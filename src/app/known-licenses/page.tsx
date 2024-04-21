"use client"

import {useQueryOptions} from "@/app/providers/query-options"
import {
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material"
import {useQuery} from "@tanstack/react-query"

export default function Home() {
  const queryOptions = useQueryOptions()
  const licenses = useQuery(queryOptions.getLicenses())

  return (
    <Container maxWidth="xl">
      <Stack spacing={4}>
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
