export type FriendProbeStatus = 'idle' | 'checking' | 'online' | 'offline'

export type FriendProbeState = {
  status: FriendProbeStatus
  latencyMs: number | null
}

export function friendProbeStatusLabel(state: FriendProbeState) {
  if (state.status === 'checking') return '检测中'
  if (state.status === 'online') return '正常'
  if (state.status === 'offline') return '离线'
  return '未检测'
}
