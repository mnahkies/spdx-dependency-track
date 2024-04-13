export type ApiLicense = {
  id: string
  external_id: string
  name: string
  group_name: string
  risk: number
}

export type ApiRepositorySummary = {
  name: string
  groups: {name: string; count: number}[]
}
