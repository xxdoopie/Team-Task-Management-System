import Employee from '@/app/(components)/Employee.jsx'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'

export default async function Page() {
  const token = cookies().get('token')?.value
  if (!token) {
    redirect('/')
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.role !== 'employee') {
      redirect('/admin')
    }
  } catch (e) {
    redirect('/')
  }

  return (
    <div>
      <Employee />
    </div>
  )
}
