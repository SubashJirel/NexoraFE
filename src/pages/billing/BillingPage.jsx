import { useResource } from '@/hooks/useOperations'
import operationsService from '@/services/operationsService'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'

export default function BillingPage() {
  const plans = useResource('subscription-plans'); const subscription = useResource('subscriptions')
  if (plans.isLoading || subscription.isLoading) return <PageSpinner />
  const current = subscription.data?.[0]
  async function checkout(code) { const result = await operationsService.checkout(code); window.location.assign(result.checkout_url) }
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-[#263238]">Subscription & billing</h2><p className="mt-1 text-sm text-[#637079]">Secure Stripe checkout, plan limits, billing periods, cancellation state, and receipt history.</p></div>{current && <Card><p className="text-xs uppercase text-[#637079]">Current plan</p><div className="mt-2 flex items-center justify-between gap-4"><div><p className="text-xl font-bold">{current.plan_details?.name}</p><p className="text-sm capitalize text-[#637079]">{current.status} · renews {current.current_period_end ? new Date(current.current_period_end).toLocaleDateString() : 'after activation'}</p></div>{current.provider_customer_id && <Button variant="outlined" onClick={async () => { const result = await operationsService.billingPortal(); window.location.assign(result.portal_url) }}>Manage billing</Button>}</div></Card>}<div className="grid gap-5 md:grid-cols-3">{(plans.data || []).map((plan) => <Card key={plan.id}><h3 className="text-xl font-bold">{plan.name}</h3><p className="mt-3 text-3xl font-black">{plan.currency} {Number(plan.price_monthly).toLocaleString()}<span className="text-sm font-normal text-[#637079]">/month</span></p><ul className="mt-5 space-y-2 text-sm text-[#637079]">{(plan.features || []).map((feature) => <li key={feature}>✓ {feature}</li>)}<li>✓ Up to {plan.max_agents} agents</li><li>✓ Up to {plan.max_properties} properties</li></ul><Button className="mt-6" fullWidth onClick={() => checkout(plan.code)}>Choose {plan.name}</Button></Card>)}</div></div>
}
