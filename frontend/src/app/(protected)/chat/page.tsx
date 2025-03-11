import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

import { Button } from "@/components/ui/button"

import { logout } from '@/app/(auth)/actions'


export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) { redirect('/sign-in') }

  return (
    <div>
      <h1>Chat</h1>
      <p>Welcome, {data.user.email}!</p>

      <form action={logout}>
      <Button type='submit'>Logout</Button>
      </form>
    </div>
  )
}