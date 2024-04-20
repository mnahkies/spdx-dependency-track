"use client"

import {t_License, t_RepositorySummary} from "@/generated/models"
import {useEagerPromise} from "@/lib/utils/usePromise"
import styles from "./page.module.css"

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
    <main className={styles.main}>
      <form
        action={async (formData) => {
          await fetch(`http://localhost:3000/api/repositories/scan`, {
            method: "post",
            body: JSON.stringify({token: formData.get("api-token")}),
          })
        }}
      >
        <label htmlFor="GH API Token">GH API Token</label>
        <input type={"text"} name={"api-token"} id={"api-token"} />
        <button type="submit">Go!</button>
      </form>

      {!summaries.loading &&
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

      {!licenses.loading && !licenses.err && (
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
