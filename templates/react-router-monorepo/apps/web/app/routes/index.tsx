import { redirect } from "react-router"

import type { Route } from "./+types/index"

export function loader(_args: Route.LoaderArgs) {
  return redirect("/markets")
}

export default function Index() {
  return null
}

