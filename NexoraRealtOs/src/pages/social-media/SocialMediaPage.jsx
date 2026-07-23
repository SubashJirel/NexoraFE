import { useState } from 'react'
import {
  Link2, Link2Off, AlertCircle, Share2,
  CheckCircle2, RefreshCw, PenSquare,
  ImageIcon, Clock, FileEdit, Send,
} from 'lucide-react'
import {
  useSocialConnections,
  useStartMetaConnection,
  useDisconnectSocialAccount,
} from '@/hooks/useSocialConnections'
import { useSocialPosts, usePublishSocialPost } from '@/hooks/useCreateSocialPost'
import { Card, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import CreatePostModal from '@/components/social/CreatePostModal'

// ── Inline SVG brand icons ────────────────────────────────────
function FacebookIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

// ── Disconnect confirmation modal ─────────────────────────────
function DisconnectModal({ account, onConfirm, onCancel, isLoading }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <Link2Off size={22} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-[#263238]">Disconnect Account</h3>
        <p className="mt-2 text-sm text-[#637079]">
          Are you sure you want to disconnect{' '}
          <span className="font-semibold text-[#263238]">{account?.name || account?.platform}</span>?
          You will stop receiving leads and won't be able to post from this account.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" size="md" className="flex-1" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="md"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent"
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
function PlatformCard({ platform, icon: Icon, brandColor, brandBg, description, connection, onConnect, onDisconnect, isConnecting, comingSoon }) {
  const isConnected = connection?.status === 'connected'
  const hasWarning = isConnected && connection?.webhook_subscription_status === 'failed'

  return (
    <Card className="overflow-hidden">
      <CardBody className="p-0">
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-4 px-6 py-5 border-b border-[#DDE5E3]',
            isConnected ? 'bg-[#f4f8f5]' : 'bg-[#F8FAFA]'
          )}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: isConnected ? brandColor : '#DDE5E3' }}
          >
            <Icon size={24} color={isConnected ? '#fff' : '#8b969d'} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-[#263238] capitalize">{platform}</h3>
              {isConnected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                  <CheckCircle2 size={10} />
                  Connected
                </span>
              )}
              {comingSoon && !isConnected && (
                <span className="inline-flex items-center rounded-full bg-[#EEF2F2] px-2 py-0.5 text-[11px] font-semibold text-[#637079]">
                  Coming soon
                </span>
              )}
            </div>

            {isConnected ? (
              <p className="mt-0.5 text-sm text-[#637079] truncate">
                {connection.name}
                {connection.username ? ` · @${connection.username}` : ''}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-[#8b969d]">Not connected</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-[#637079] leading-relaxed">{description}</p>

          {/* Connected details */}
          {isConnected && (
            <div className="grid grid-cols-2 gap-3">
              {connection.page_id && (
                <div className="rounded-lg bg-[#F8FAFA] px-3 py-2 border border-[#DDE5E3]">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8b969d]">Page ID</p>
                  <p className="mt-0.5 text-sm font-medium text-[#263238] truncate">{connection.page_id}</p>
                </div>
              )}
              {connection.created_at && (
                <div className="rounded-lg bg-[#F8FAFA] px-3 py-2 border border-[#DDE5E3]">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8b969d]">Connected</p>
                  <p className="mt-0.5 text-sm font-medium text-[#263238]">
                    {new Date(connection.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Webhook warning */}
          {hasWarning && (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Messaging webhooks could not be subscribed. Lead capture from conversations may not work until <strong>pages_messaging</strong> permission is granted.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            {comingSoon && !isConnected ? (
              <Button variant="outline" size="sm" disabled>Coming Soon</Button>
            ) : isConnected ? (
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
                  leftIcon={<RefreshCw size={14} />}
                  onClick={onConnect}
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
                onClick={onConnect}
                isLoading={isConnecting}
              >
                Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// ── How it works ──────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { step: '1', title: 'Connect your account', desc: 'Click "Connect Facebook" to authenticate via Facebook\'s secure OAuth flow.' },
    { step: '2', title: 'Select your Page', desc: 'Choose which Facebook Page (and linked Instagram) to link to your CRM.' },
    { step: '3', title: 'Post from the CRM', desc: 'Create and publish property listings directly to your connected Pages.' },
    { step: '4', title: 'Leads flow in automatically', desc: 'Conversations from your posts are captured as leads in the CRM.' },
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

// ── Publish confirmation modal ────────────────────────────────

function PublishModal({ post, onConfirm, onCancel, isLoading }) {
  // Derive available platforms from the post's platform field.
  // The API accepts an array; we pre-select the post's own platform.
  const available = post?.platform ? [post.platform] : []
  const [selected, setSelected] = useState(available)

  function toggle(p) {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3f0]">
          <Send size={20} className="text-[#496B5A]" />
        </div>
        <h3 className="text-lg font-bold text-[#263238]">Publish Post</h3>
        <p className="mt-2 text-sm text-[#637079]">
          Select the platforms to publish to. This will post immediately.
        </p>

        {/* caption preview */}
        {post?.caption && (
          <p className="mt-3 rounded-lg border border-[#DDE5E3] bg-[#F8FAFA] px-3 py-2 text-xs text-[#637079] line-clamp-3 leading-relaxed">
            {post.caption}
          </p>
        )}

        {/* platform toggles */}
        <div className="mt-4 flex flex-wrap gap-2">
          {available.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                selected.includes(p)
                  ? 'border-[#496B5A] bg-[#eef3f0] text-[#496B5A]'
                  : 'border-[#DDE5E3] bg-white text-[#637079] hover:border-[#B8C9C5]'
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  selected.includes(p) ? 'bg-[#496B5A]' : 'bg-[#DDE5E3]'
                )}
              />
              {p}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            loading={isLoading}
            disabled={selected.length === 0}
            onClick={() => onConfirm(selected)}
          >
            Publish Now
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Posts list ────────────────────────────────────────────────

const STATUS_STYLES = {
  draft:     'bg-[#EEF2F2] text-[#637079]',
  scheduled: 'bg-amber-50 text-amber-700',
  published: 'bg-green-100 text-green-700',
  failed:    'bg-red-50 text-red-600',
}

function PostCard({ post, onPublish, isPublishing }) {
  const statusLabel = post.status?.charAt(0).toUpperCase() + post.status?.slice(1)
  const canPublish = post.status === 'draft' || post.status === 'failed'

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex">
        {/* image thumbnail */}
        {post.image ? (
          <div className="shrink-0 w-20 h-auto sm:w-24">
            <img src={post.image} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-[#EEF2F2]">
            <ImageIcon size={22} className="text-[#B8C9C5]" />
          </div>
        )}

        {/* content */}
        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-[#263238] line-clamp-2 leading-snug">
              {post.caption || <span className="italic text-[#8b969d]">No caption</span>}
            </p>
            <span className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              STATUS_STYLES[post.status] ?? STATUS_STYLES.draft
            )}>
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3 text-[11px] text-[#8b969d] flex-wrap">
              <span className="capitalize font-medium text-[#637079]">{post.platform}</span>
              {post.created_by_name && <span>by {post.created_by_name}</span>}
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              {post.scheduled_at && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock size={11} />
                  {new Date(post.scheduled_at).toLocaleString()}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={11} />
                  {new Date(post.published_at).toLocaleString()}
                </span>
              )}
            </div>

            {/* publish action */}
            {canPublish && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Send size={12} />}
                loading={isPublishing}
                onClick={() => onPublish(post)}
                className="shrink-0 text-xs h-7 px-2.5"
              >
                Publish
              </Button>
            )}
          </div>

          {/* error message if failed */}
          {post.status === 'failed' && post.error_message && (
            <div className="flex gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5">
              <AlertCircle size={12} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-[11px] text-red-600 leading-snug">{post.error_message}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function PostsList() {
  const { data: posts = [], isLoading, isError, refetch } = useSocialPosts()
  const { mutate: publishPost, isPending: isPublishing, variables: publishingVars } = usePublishSocialPost()

  const [publishTarget, setPublishTarget] = useState(null)

  if (isLoading) return <PageSpinner />

  if (isError) return (
    <Card>
      <CardBody className="flex flex-col items-center py-10 text-center">
        <AlertCircle size={32} className="text-red-400 mb-3" />
        <p className="font-semibold text-[#263238]">Failed to load posts</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={refetch}>Try again</Button>
      </CardBody>
    </Card>
  )

  const list = Array.isArray(posts) ? posts : (posts?.results ?? [])

  if (list.length === 0) return (
    <Card>
      <CardBody className="flex flex-col items-center py-12 text-center">
        <FileEdit size={36} className="text-[#B8C9C5] mb-3" />
        <p className="font-semibold text-[#263238]">No posts yet</p>
        <p className="mt-1 text-sm text-[#637079]">
          Create your first post using the button above.
        </p>
      </CardBody>
    </Card>
  )

  return (
    <>
      <div className="flex flex-col gap-3">
        {list.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPublish={setPublishTarget}
            isPublishing={isPublishing && publishingVars?.id === post.id}
          />
        ))}
      </div>

      {publishTarget && (
        <PublishModal
          post={publishTarget}
          onConfirm={(platforms) =>
            publishPost(
              { id: publishTarget.id, platforms },
              { onSuccess: () => setPublishTarget(null) }
            )
          }
          onCancel={() => setPublishTarget(null)}
          isLoading={isPublishing}
        />
      )}
    </>
  )
}

// ── Tabs ──────────────────────────────────────────────────────

function Tabs({ active, onChange }) {
  const tabs = [
    { id: 'connections', label: 'Connections' },
    { id: 'posts',       label: 'Posts' },
  ]
  return (
    <div className="flex gap-1 rounded-xl bg-[#EEF2F2] p-1 w-fit">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-150',
            active === t.id
              ? 'bg-white text-[#263238] shadow-sm'
              : 'text-[#637079] hover:text-[#263238]'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function SocialMediaPage() {
  const { data: connections = [], isLoading, isError, refetch } = useSocialConnections()
  const { mutate: startMeta, isPending: isConnecting } = useStartMetaConnection()
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectSocialAccount()

  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [tab, setTab] = useState('connections')
  const [showCreatePost, setShowCreatePost] = useState(false)

  const getConnection = (platform) =>
    connections.find((c) => c.platform?.toLowerCase() === platform)

  const connectedAccounts = connections.filter((c) => c.status === 'connected')

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
            Connect your social accounts to post listings and capture leads automatically.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {connectedAccounts.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PenSquare size={14} />}
              onClick={() => setShowCreatePost(true)}
            >
              Create Post
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
            onClick={refetch}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <Tabs active={tab} onChange={setTab} />

      {/* ── Tab: Connections ─────────────────────────────── */}
      {tab === 'connections' && (
        <>
          {/* How it works */}
          <HowItWorks />

          {/* Platform cards */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8b969d]">
              Integrations
            </h3>

            {isLoading ? (
              <PageSpinner />
            ) : isError ? (
              <Card>
                <CardBody className="flex flex-col items-center py-12 text-center">
                  <AlertCircle size={36} className="text-red-400 mb-3" />
                  <p className="font-semibold text-[#263238]">Failed to load connections</p>
                  <p className="mt-1 text-sm text-[#637079]">Could not fetch your connected accounts.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>Try again</Button>
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlatformCard
                  platform="facebook"
                  icon={FacebookIcon}
                  brandColor="#1877F2"
                  brandBg="#1877F2"
                  description="Post property listings to your Facebook Page, respond to inquiries, and automatically capture conversations as leads."
                  connection={getConnection('facebook')}
                  onConnect={() => startMeta()}
                  onDisconnect={setDisconnectTarget}
                  isConnecting={isConnecting}
                />
                <PlatformCard
                  platform="instagram"
                  icon={InstagramIcon}
                  brandColor="#E1306C"
                  brandBg="#E1306C"
                  description="Share property photos and stories. Connecting your Facebook Page will also link any attached Instagram Business account."
                  connection={getConnection('instagram')}
                  onConnect={() => startMeta()}
                  onDisconnect={setDisconnectTarget}
                  isConnecting={isConnecting}
                />
              </div>
            )}
          </div>

          {/* Info note */}
          <div className="flex gap-3 rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] px-5 py-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#496B5A]" />
            <p className="text-sm text-[#637079] leading-relaxed">
              After connecting, Facebook redirects back to the server. Simply navigate back to this page
              to see your connected accounts. You can revoke access at any time from your{' '}
              <a
                href="https://www.facebook.com/settings?tab=business_tools"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#496B5A] underline underline-offset-2 hover:text-[#3a5649]"
              >
                Facebook Business Settings
              </a>.
            </p>
          </div>
        </>
      )}

      {/* ── Tab: Posts ───────────────────────────────────── */}
      {tab === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8b969d]">
              All Posts
            </h3>
            {connectedAccounts.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PenSquare size={14} />}
                onClick={() => setShowCreatePost(true)}
              >
                Create Post
              </Button>
            )}
          </div>

          {connectedAccounts.length === 0 ? (
            <Card>
              <CardBody className="flex flex-col items-center py-12 text-center">
                <Share2 size={36} className="text-[#B8C9C5] mb-3" />
                <p className="font-semibold text-[#263238]">No connected accounts</p>
                <p className="mt-1 text-sm text-[#637079]">
                  Connect a Facebook or Instagram account first.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setTab('connections')}>
                  Go to Connections
                </Button>
              </CardBody>
            </Card>
          ) : (
            <PostsList />
          )}
        </div>
      )}

      {/* ── Disconnect modal ──────────────────────────────── */}
      {disconnectTarget && (
        <DisconnectModal
          account={disconnectTarget}
          onConfirm={() => disconnect(disconnectTarget.id, { onSuccess: () => setDisconnectTarget(null) })}
          onCancel={() => setDisconnectTarget(null)}
          isLoading={isDisconnecting}
        />
      )}

      {/* ── Create post modal ─────────────────────────────── */}
      <CreatePostModal
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        connections={connectedAccounts}
      />
    </div>
  )
}
