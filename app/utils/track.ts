export function track(name: string, data?: Record<string, string | number>) {
  if (!import.meta.client) {
    return
  }
  const umami = (
    window as Window & {
      umami?: { track?: (event: string, payload?: Record<string, string | number>) => void }
    }
  ).umami
  umami?.track?.(name, data)
}
