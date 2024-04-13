"use client"

import {ApiLicense} from "@/lib/types"
import {useEagerPromise} from "@/lib/utils/usePromise"
import styles from "./page.module.css"

export default function Home() {
  const licenses = useEagerPromise<ApiLicense[]>(async () => {
    const res = await fetch(`http://localhost:3000/api/licenses`)
    return await res.json()
  })

  return (
    <main className={styles.main}>
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
