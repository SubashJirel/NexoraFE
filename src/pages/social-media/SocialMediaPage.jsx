import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Link2, Link2Off, AlertCircle, Share2,
  CheckCircle2, RefreshCw, PenSquare,
  ImageIcon, Clock, FileEdit, Send, Pencil, Trash2,
} from 'lucide-react'
import {
  useSocialConnections,
  useStartMetaConnection,
  useDisconnectSocialAccount,
  useMetaConnectionSession,
  useCompleteMetaConnectionSession,
} from '@/hooks/useSocialConnections'
import { useSocialPosts, usePublishSocialPost, useDeleteSocialPost } from '@/hooks/useCreateSocialPost'
import { Card, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import CreatePostModal from '@/components/social/CreatePostModal'
import { useAuthStore } from '@/store/authStore'

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

function PageSelectionModal({ token, onComplete, onCancel }) {
  const { data, isLoading, isError } = useMetaConnectionSession(token)
  const { mutate: complete, isPending } = useCompleteMetaConnectionSession({
    onSuccess: onComplete,
  })
  const [selected, setSelected] = useState([])

  function toggle(pageId) {
    setSelected((current) => (
      current.includes(pageId)
        ? current.filter((id) => id !== pageId)
        : [...current, pageId]
    ))
  }

  return (
    <div className="fixed inset-0 z-[310] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-[#263238]">Choose Pages to connect</h3>
        <p className="mt-2 text-sm text-[#637079]">
          Only the Pages you select—and their linked Instagram professional accounts—will be available in Nexora.
        </p>

        {isLoading && <div className="py-10"><PageSpinner /></div>}
        {isError && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            This Page-selection session expired or could not be loaded. Start the connection again.
          </div>
        )}
        {!isLoading && !isError && (
          <div className="mt-5 max-h-72 space-y-2 overflow-y-auto">
            {data?.pages?.map((page) => (
              <label key={page.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#DDE5E3] p-4 hover:bg-[#F8FAFA]">
                <input
                  type="checkbox"
                  checked={selected.includes(page.id)}
                  onChange={() => toggle(page.id)}
                  className="h-4 w-4 accent-[#496B5A]"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#263238]">{page.name}</p>
                  <p className="mt-0.5 text-xs text-[#637079]">
                    Facebook Page{page.has_instagram ? ' · Linked Instagram account detected' : ''}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>Cancel</Button>
          <Button
            variant="primary"
            loading={isPending}
            disabled={isLoading || isError || selected.length === 0}
            onClick={() => complete({ token, pageIds: selected })}
          >
            Connect selected Pages
          </Button>
        </div>
      </div>
    </div>
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
function PlatformCard({ platform, icon: Icon, brandColor, description, connections = [], onConnect, onDisconnect, isConnecting, canManage }) {
  const activeConnections = connections.filter((connection) => connection.status === 'connected')
  const isConnected = activeConnections.length > 0
  const hasWarning = activeConnections.some((connection) => connection.webhook_subscription_status === 'failed')

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
            </div>

            {isConnected ? (
              <p className="mt-0.5 text-sm text-[#637079] truncate">
                {activeConnections.length} connected account{activeConnections.length === 1 ? '' : 's'}
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
            <div className="space-y-2">
              {activeConnections.map((connection) => (
                <div key={connection.id} className="flex items-center gap-3 rounded-lg border border-[#DDE5E3] bg-[#F8FAFA] px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#263238]">{connection.name || platform}</p>
                    <p className="truncate text-[11px] text-[#637079]">
                      {connection.username ? `@${connection.username} · ` : ''}Page {connection.page_id}
                    </p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => onDisconnect(connection)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      aria-label={`Disconnect ${connection.name || platform}`}
                    >
                      <Link2Off size={14} />
                    </button>
                  )}
                </div>
              ))}
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
            {canManage ? (
              isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw size={14} />}
                  onClick={onConnect}
                  isLoading={isConnecting}
                >
                  Connect another Page
                </Button>
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
              )
            ) : (
              <p className="text-xs text-[#637079]">Only an agency owner or manager can change connections.</p>
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

function PublishModal({ post, connections, onConfirm, onCancel, isLoading }) {
  const primaryAccount = connections.find((account) => account.id === post?.social_account)
  const linkedPlatforms = connections
    .filter((account) => (
      account.status === 'connected' &&
      primaryAccount?.page_id &&
      account.page_id === primaryAccount.page_id
    ))
    .map((account) => account.platform)
  const available = [...new Set([
    ...linkedPlatforms,
    ...(post?.target_platforms || []),
    ...(post?.platform ? [post.platform] : []),
  ])]
  const [selected, setSelected] = useState(
    post?.target_platforms?.length ? post.target_platforms : available
  )

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

// ── Delete confirmation modal ─────────────────────────────────

function DeletePostModal({ post, onConfirm, onCancel, isLoading }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-[#263238]">Delete Post</h3>
        <p className="mt-2 text-sm text-[#637079]">
          Are you sure you want to delete this post? If it was published through Nexora, the system will also attempt to delete it from Meta before removing the CRM record.
        </p>
        {post?.caption && (
          <p className="mt-3 rounded-lg border border-[#DDE5E3] bg-[#F8FAFA] px-3 py-2 text-xs text-[#637079] line-clamp-2 leading-relaxed italic">
            "{post.caption}"
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="md"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent"
            loading={isLoading}
            onClick={onConfirm}
          >
            Delete
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
  partial:   'bg-orange-50 text-orange-700',
  failed:    'bg-red-50 text-red-600',
}

function PostCard({ post, onPublish, isPublishing, onEdit, onDelete }) {
  const statusLabel = post.status?.charAt(0).toUpperCase() + post.status?.slice(1)
  const canPublish = ['draft', 'failed', 'partial'].includes(post.status)
  const canEdit    = true
  const mediaCount = Array.isArray(post.media) && post.media.length > 0
    ? post.media.length
    : post.image ? 1 : 0
  const coverImage = post.media?.[0]?.image ?? post.image
  const isReel = post.post_format === 'reel' || Boolean(post.video)

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex">
        {/* image thumbnail */}
        {isReel && post.video ? (
          <div className="relative shrink-0 w-20 h-28 overflow-hidden bg-black sm:w-24 sm:h-32">
            <video src={post.video} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Reel
            </span>
          </div>
        ) : coverImage ? (
          <div className="relative shrink-0 w-20 h-auto sm:w-24">
            <img src={coverImage} alt="" className="w-full h-full object-cover" />
            {mediaCount > 1 && (
              <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                1/{mediaCount}
              </span>
            )}
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
              <span className="capitalize font-medium text-[#637079]">{isReel ? 'Reel' : post.platform}</span>
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

            {/* publish / edit / delete actions */}
            {(canPublish || canEdit) && (
              <div className="flex items-center gap-1.5 shrink-0">
                {canEdit && (
                  <Button
                    variant="outlined"
                    size="sm"
                    leftIcon={<Pencil size={12} />}
                    onClick={() => onEdit(post)}
                    className="text-xs h-7 px-2.5"
                  >
                    Edit
                  </Button>
                )}
                {canPublish && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Send size={12} />}
                    loading={isPublishing}
                    onClick={() => onPublish(post)}
                    className="text-xs h-7 px-2.5"
                  >
                    Publish
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(post)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8b969d] hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label="Delete post"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* error message if failed */}
          {['failed', 'partial'].includes(post.status) && post.error_message && (
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

function PostsList({ connections }) {
  const { data: posts = [], isLoading, isError, refetch } = useSocialPosts()
  const { mutate: publishPost, isPending: isPublishing, variables: publishingVars } = usePublishSocialPost()
  const { mutate: deletePost,  isPending: isDeleting }                               = useDeleteSocialPost()

  const [publishTarget, setPublishTarget] = useState(null)
  const [editTarget,    setEditTarget]    = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)

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
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      {publishTarget && (
        <PublishModal
          post={publishTarget}
          connections={connections}
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

      {/* edit modal — reuses CreatePostModal in edit mode */}
      <CreatePostModal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        post={editTarget}
        connections={connections}
      />

      {/* delete confirmation modal */}
      {deleteTarget && (
        <DeletePostModal
          post={deleteTarget}
          onConfirm={() =>
            deletePost(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
          }
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
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
  const role = useAuthStore((state) => state.user?.role)
  const canManageConnections = ['agency_owner', 'agency_manager'].includes(role)
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: connections = [], isLoading, isError, refetch } = useSocialConnections()
  const { mutate: startMeta, isPending: isConnecting } = useStartMetaConnection()
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectSocialAccount()

  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [tab, setTab] = useState('connections')
  const [showCreatePost, setShowCreatePost] = useState(false)

  const getConnections = (platform) =>
    connections.filter((c) => c.platform?.toLowerCase() === platform)

  const connectedAccounts = connections.filter((c) => c.status === 'connected')
  const connectionSessionToken = searchParams.get('meta_connection') === 'select'
    ? searchParams.get('connection_session')
    : null

  function clearConnectionResult() {
    setSearchParams({}, { replace: true })
  }

  useEffect(() => {
    if (searchParams.get('meta_connection') === 'error') {
      const code = searchParams.get('error_code')
      toast.error(
        code === 'no_pages'
          ? 'Meta did not return any Facebook Pages that you can manage.'
          : 'The Meta connection was cancelled or could not be completed.'
      )
      clearConnectionResult()
    }
  // Search params are intentionally handled once after the OAuth redirect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
                  description="Post property listings to your Facebook Page, respond to inquiries, and automatically capture conversations as leads."
                  connections={getConnections('facebook')}
                  onConnect={() => startMeta()}
                  onDisconnect={setDisconnectTarget}
                  isConnecting={isConnecting}
                  canManage={canManageConnections}
                />
                <PlatformCard
                  platform="instagram"
                  icon={InstagramIcon}
                  brandColor="#E1306C"
                  description="Share property photos and stories. Connecting your Facebook Page will also link any attached Instagram Business account."
                  connections={getConnections('instagram')}
                  onConnect={() => startMeta()}
                  onDisconnect={setDisconnectTarget}
                  isConnecting={isConnecting}
                  canManage={canManageConnections}
                />
              </div>
            )}
          </div>

          {/* Info note */}
          <div className="flex gap-3 rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] px-5 py-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#496B5A]" />
            <p className="text-sm text-[#637079] leading-relaxed">
              After Meta authorization, Nexora asks which Facebook Pages you want to connect. Only agency owners and managers can change these connections. You can also revoke access from your{' '}
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
            <PostsList connections={connectedAccounts} />
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

      {connectionSessionToken && (
        <PageSelectionModal
          token={connectionSessionToken}
          onComplete={() => {
            clearConnectionResult()
            refetch()
          }}
          onCancel={clearConnectionResult}
        />
      )}
    </div>
  )
}
