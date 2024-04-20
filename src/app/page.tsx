"use client"

import {ApiLicense, ApiRepositorySummary} from "@/lib/types"
import {useEagerPromise} from "@/lib/utils/usePromise"
import styles from "./page.module.css"

export default function Home() {
  const licenses = useEagerPromise<ApiLicense[]>(async () => {
    const res = await fetch(`http://localhost:3000/api/licenses`)
    return await res.json()
  })

  const summaries = useEagerPromise<ApiRepositorySummary[]>(async () => {
    const res = await fetch(`http://localhost:3000/api/repositories/summary`)
    return await res.json()
  })

  return (
    <main className={styles.main}>
      <form
        action={async (formData) => {
          const res = await fetch(
            `http://localhost:3000/api/repositories/crawl`,
            {
              method: "post",
              body: JSON.stringify({token: formData.get("api-token")}),
            },
          )
        }}
      >
        <label htmlFor="GH API Token">GH API Token</label>
        <input type={"text"} name={"api-token"} id={"api-token"} />
        <button type="submit">Go!</button>
      </form>

      {summaries.loading === false &&
        !summaries.err &&
        summaries.data.map((summary) => (
          <div key={summary.name}>
            <h2>{summary.name}</h2>
            <ul>
              {summary.groups.map((group) => (
                <li key={group.name}>
                  <b>{group.name}</b>: {group.count}
                </li>
              ))}
            </ul>
          </div>
        ))}

      {licenses.loading === false && !licenses.err && (
        <ul>
          {licenses.data.map((it) => {
            return (
              <li key={it.external_id}>
                {it.group_name}, {it.name}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
