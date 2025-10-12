export default function Page() {
  return (
    <main className="p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold">Secure Drops (MERN)</h1>
        <p className="text-muted-foreground">
          This preview page is a minimal placeholder for the MERN project you just generated. Your actual frontend lives
          in <code>/client</code> (React + Vite) and the backend lives in <code>/server</code> (Express + MongoDB).
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>
            Build the React app in <code>client/</code> and set <code>VITE_API_BASE_URL</code> to your deployed API.
          </li>
          <li>
            Run the API in <code>server/</code> with the environment in <code>server/.env.example</code>.
          </li>
          <li>This page only fixes the preview by exporting a default component.</li>
        </ul>
      </div>
    </main>
  )
}
