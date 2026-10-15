const BEARER_PREFIX_RE = /^Bearer\s+/i

export default defineEventHandler(async (event) => {
  const { server } = getRouterParams(event)
  const query = getQuery(event)
  const headerKey = getHeader(event, 'x-admin-key') || getHeader(event, 'authorization')?.replace(BEARER_PREFIX_RE, '')
  const key = (typeof query.key === 'string' ? query.key : undefined) || headerKey

  if (!server) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing server parameter',
    })
  }

  const adminKey = useRuntimeConfig().adminKey
  if (!adminKey || typeof adminKey !== 'string' || !adminKey.trim()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin key is not configured',
    })
  }

  if (!key || key !== adminKey) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Incorrect admin key',
    })
  }

  await deleteApp(server)

  return { status: true }
})
