"use server"
import { getServerSession } from "next-auth"
import LogoutButton from "../components/LogoutButton"

export default async function Settings() {
  const session = await getServerSession()

  if (!session) {
    return <p>You must be logged in to see your wins!</p>
  }

  return (
    <div>
        <h1>Welcome back, {session.user?.name}</h1>
        <LogoutButton />
    </div>
  )
}