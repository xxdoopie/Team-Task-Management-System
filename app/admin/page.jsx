import Admin from '@/app/(components)/Admin.jsx'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'

export default async function Page() {
  const token = (await cookies()).get('token')?.value; // Await cookies()
  if (!token) {
    redirect('/')
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.role !== 'admin') {
      redirect('/employee')
    }
  } catch (e) {
    redirect('/')
  }

  return (
    <div>
      <Admin />
    </div>
  )
}
