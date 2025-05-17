"use client"

import {useQueryOptions} from "@/app/providers/query-options"
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
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
import type React from "react"
import {use} from "react"
import {useState} from "react"

const DependencyName: React.FC<{name: string; version: string}> = ({
  name,
  version,
}) => {
  if (name.startsWith("npm:")) {
    return (
      <Link
        target={"_blank"}
        href={`https://www.npmjs.com/package/${name
          .split("npm:")
          .slice(1)
          .join("npm:")}/v/${version}`}
      >
        {name}
      </Link>
    )
  }

  return name
}

export default function RepositoryScanPage({
  params,
}: {params: Promise<{repositoryId: string; scanId: string}>}) {
  const {repositoryId, scanId} = use(params)
  const [excludePermissive, setExcludePermissive] = useState<boolean>(false)

  const queryOptions = useQueryOptions()
  const summary = useQuery(queryOptions.getRepositorySummary(repositoryId))
  const dependencies = useQuery(
    queryOptions.getRepositoryScanDependencies(
      repositoryId,
      scanId,
      excludePermissive,
    ),
  )

  return (
    <Stack>
      <Typography variant="h2" gutterBottom>
        Scan for {summary.isSuccess && summary.data.name}
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={excludePermissive}
              onChange={() => setExcludePermissive(!excludePermissive)}
            />
          }
          label="Exclude Permissive"
        />
      </FormGroup>
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
              // TODO: we get some duplicates here.
              dependencies.data.map((dependency) => (
                <TableRow
                  key={`${dependency.dependencyName}-${dependency.dependencyVersion}`}
                >
                  <TableCell>
                    <DependencyName
                      version={dependency.dependencyVersion}
                      name={dependency.dependencyName}
                    />
                  </TableCell>
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
