import nextConfig from '../../next.config'

describe('next.config.ts', () => {
  it('should have cacheComponents enabled', () => {
    expect(nextConfig).toHaveProperty('cacheComponents', true)
  })

  it('should have reactCompiler enabled', () => {
    expect(nextConfig).toHaveProperty('reactCompiler', true)
  })

  it('should have experimental turbopack cache enabled', () => {
    expect(nextConfig.experimental).toHaveProperty(
      'turbopackFileSystemCacheForDev',
      true
    )
  })

  it('should have Cloudinary image configuration', () => {
    const cloudinaryPattern = nextConfig.images!.remotePatterns!.find(
      (pattern) => pattern.hostname === 'res.cloudinary.com'
    )

    expect(cloudinaryPattern).toBeDefined()
    expect(cloudinaryPattern?.protocol).toBe('https')
  })

  it('should have PostHog rewrites configured', async () => {
    const rewrites = await nextConfig.rewrites!()

    expect(rewrites).toHaveLength(2)
    expect(rewrites.some(r => r.source === '/ingest/static/:path*')).toBe(true)
    expect(rewrites.some(r => r.source === '/ingest/:path*')).toBe(true)
  })

  it('should use HTTPS for external rewrites', async () => {
    const rewrites = await nextConfig.rewrites!()
    rewrites.forEach((rewrite) => {
      expect(rewrite.destination).toMatch(/^https:\/\//)
    })
  })
})