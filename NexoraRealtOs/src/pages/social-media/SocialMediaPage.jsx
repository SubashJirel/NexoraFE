import { useState } from 'react'
import {
  Facebook,
  Instagram,
  Link2,
  Link2Off,
  CheckCircle2,
  AlertCircle,
  Share2,
  ExternalLink,
} from 'lucide-react'
import {
  useSocialConnections,
  useStartMetaConnection,
  useDisconnectSocialAccount,
} from '@/hooks/useSocialConnections'
import { Card, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'

// ── Confirmation modal ────────────────────────────────────────
function DisconnectModal({ account, onConfirm, onCancel, isLoading }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <Link2Off size={22} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-[#263238]">Disconnect Account</h3>
        <p className="mt-2 text-sm text-[#637079]">
          Are you sure you want to disconnect{' '}
          <span className="font-semibold text-[#263238]">{account?.page_name || account?.platform}</span>
          ? You'll stop receiving leads and won't be able to post from this account.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Platform card ─────────────────────────────────────────────
function PlatformCard({ platform, connection, onConnect, onDisconnect, isConnecting }) {
  const isConnected = !!connection

  const platformMeta = {
    facebook: {
      name: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      bg: '#E7F0FD',
      description: 'Post listings, respond to inquiries, and capture leads directly from your Facebook Page.',
    },
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      color: '#E1306C',
      bg: '#FDE7EF',
      description: 'Share property photos and stories. Conversations become leads automatically.',
    },
  }

  const meta = platformMeta[platform]
  const Icon = meta.icon

  return (
    <Card className="overflow-hidden">
      <CardBody className="p-0">
        {/* Header strip */}
        <div
          className="flex items-center gap-4 px-6 py-5 border-b border-[#DDE5E3]"
          style={{ background: isConnected ? meta.bg : '#F8FAFA' }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: isConnected ? meta.color : '#DDE5E3' }}
          >
            <Icon size={24} color={isConnected ? '#fff' : '#8b969d'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#263238]">{meta.name}</h3>
              {isConnected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                  <CheckCircle2 size={10} />
                  Connected
                </span>
              )}
            </div>
            {isConnected ? (
              <p className="mt-0.5 text-sm text-[#637079] truncate">
                {connection.page_name || connection.account_name || `@${connection.username || 'account'}`}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-[#8b969d]">Not connected</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-[#637079] leading-relaxed">{meta.description}</p>

          {/* Connected details */}
          {isConnected && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {connection.page_id && (
                <div className="rounded-lg bg-[#F8FAFA] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8b969d]">Page ID</p>
                  <p className="mt-0.5 text-sm font-medium text-[#263238] truncate">{connection.page_id}</p>
                </div>
              )}
              {connection.connected_at && (
                <div className="rounded-lg bg-[#F8FAFA] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8b969d]">Connected</p>
                  <p className="mt-0.5 text-sm font-medium text-[#263238]">
                    {new Date(connection.connected_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Link2Off size={14} />}
                  onClick={() => onDisconnect(connection)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Disconnect
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ExternalLink size={14} />}
                  onClick={() => onConnect()}
                  isLoading={isConnecting}
                >
                  Reconnect
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Link2 size={14} />}
                onClick={() => onConnect()}
                isLoading={isConnecting}
              >
                Connect {meta.name}
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// ── How it works section ──────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Connect your account',
      desc: 'Click "Connect Facebook" to authenticate via Facebook's secure OAuth flow.',
    },
    {
      step: '2',
      title: 'Select your Page',
      desc: 'Choose which Facebook Page (and linked Instagram account) to link to your CRM.',
    },
    {
      step: '3',
      title: 'Post from the CRM',
      desc: 'Create and publish property listings directly to your connected Pages.',
    },
    {
      step: '4',
      title: 'Leads flow in automatically',
      desc: 'Conversations and inquiries from your posts are captured as leads in the CRM.',
    },
  ]

  return (
    <Card>
      <CardBody className="px-6 py-5">
        <h3 className="font-bold text-[#263238] mb-4">How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#496B5A] text-white text-xs font-bold">
                {s.step}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#263238]">{s.title}</p>
                <p className="mt-0.5 text-xs text-[#637079] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function SocialMediaPage() {
  const { data: connections = [], isLoading, isError, refetch } = useSocialConnections()
  const { mutate: startMeta, isPending: isConnecting } = useStartMetaConnection()
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectSocialAccount()

  const [disconnectTarget, setDisconnectTarget] = useState(null)

  const getConnection = (platform) =>
    connections.find((c) => c.platform?.toLowerCase() === platform)

  function handleConnect() {
    startMeta()
  }

  function handleDisconnectConfirm() {
    disconnect(disconnectTarget.id, {
      onSuccess: () => setDisconnectTarget(null),
    })
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Share2 size={22} className="text-[#496B5A]" />
            <h2 className="text-2xl font-bold text-[#263238]">Social Media</h2>
          </div>
          <p className="mt-1 text-sm text-[#637079]">
            Connect your Facebook and Instagram accounts to post listings and capture leads.
          </p>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────── */}
      <HowItWorks />

      {/* ── Connections ──────────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#8b969d]">
          Connected Accounts
        </h3>

        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <Card>
            <CardBody className="flex flex-col items-center py-12 text-center">
              <AlertCircle size={36} className="text-red-400 mb-3" />
              <p className="font-semibold text-[#263238]">Failed to load connections</p>
              <p className="mt-1 text-sm text-[#637079]">
                Could not fetch your connected accounts.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>
                Try again
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlatformCard
              platform="facebook"
              connection={getConnection('facebook')}
              onConnect={handleConnect}
              onDisconnect={setDisconnectTarget}
              isConnecting={isConnecting}
            />
            <PlatformCard
              platform="instagram"
              connection={getConnection('instagram')}
              onConnect={handleConnect}
              onDisconnect={setDisconnectTarget}
              isConnecting={isConnecting}
            />
          </div>
        )}
      </div>

      {/* ── Info note ────────────────────────────────────── */}
      <div className="flex gap-3 rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] px-5 py-4">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#496B5A]" />
        <p className="text-sm text-[#637079] leading-relaxed">
          Connecting your Facebook account will also give access to your linked{' '}
          <span className="font-medium text-[#263238]">Instagram Business account</span> if one is
          attached to the same Page. You can manage permissions anytime from your{' '}
          <a
            href="https://www.facebook.com/settings?tab=business_tools"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#496B5A] underline underline-offset-2 hover:text-[#3a5649]"
          >
            Facebook Business Settings
          </a>
          .
        </p>
      </div>

      {/* ── Disconnect confirmation modal ─────────────────── */}
      {disconnectTarget && (
        <DisconnectModal
          account={disconnectTarget}
          onConfirm={handleDisconnectConfirm}
          onCancel={() => setDisconnectTarget(null)}
          isLoading={isDisconnecting}
        />
      )}
    </div>
  )
}
