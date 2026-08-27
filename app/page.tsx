import { SicafDashboard } from '@/components/sicaf-dashboard'
import { getEvents } from '@/lib/pocketbase'

export default async function Page() {
  const events = await getEvents()
  return <SicafDashboard events={events} />
}
