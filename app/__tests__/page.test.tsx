import { render, screen } from '@testing-library/react'
import Page from '../page'
import { cacheLife } from 'next/cache'

jest.mock('@/components/custom/EventCard', () => {
  return function MockEventCard({ title }: { title: string }) {
    return <div data-testid="event-card">{title}</div>
  }
})

jest.mock('@/components/custom/ExploreBtn', () => {
  return function MockExploreBtn() {
    return <button data-testid="explore-btn">Explore</button>
  }
})

const mockCacheLife = cacheLife as jest.MockedFunction<typeof cacheLife>

describe('Page (Home)', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    global.fetch = jest.fn()
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  it('should render page with events when API call succeeds', async () => {
    const mockEvents = [
      {
        title: 'React Summit 2025',
        slug: 'react-summit-2025',
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ events: mockEvents }),
    })

    const result = await Page()
    render(result)

    expect(screen.getByText(/The Hub for Every Dev/)).toBeInTheDocument()
  })

  it('should call cacheLife with hours parameter', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    })

    await Page()

    expect(mockCacheLife).toHaveBeenCalledWith('hours')
  })

  it('should throw error when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(Page()).rejects.toThrow('Failed to fetch events: 500')
  })

  it('should handle empty events array', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    })

    const result = await Page()
    render(result)

    expect(screen.queryAllByTestId('event-card')).toHaveLength(0)
  })

  it('should use correct API endpoint', async () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com'

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    })

    await Page()

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api/events',
      expect.any(Object)
    )
  })
})