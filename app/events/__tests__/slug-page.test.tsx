import { render, screen } from '@testing-library/react'
import EventDetailsPage from '../[slug]/page'
import { getSimilarEventsBySlug } from '@/lib/actions/event.actions'
import { notFound } from 'next/navigation'
import { cacheLife } from 'next/cache'

jest.mock('@/lib/actions/event.actions', () => ({
  getSimilarEventsBySlug: jest.fn(),
}))

jest.mock('@/components/custom/BookEvent', () => {
  return function MockBookEvent() {
    return <div data-testid="book-event">Book Event Form</div>
  }
})

jest.mock('@/components/custom/EventCard', () => {
  return function MockEventCard({ title }: { title: string }) {
    return <div data-testid="similar-event-card">{title}</div>
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}))

const mockGetSimilarEvents = getSimilarEventsBySlug as jest.MockedFunction<
  typeof getSimilarEventsBySlug
>
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>
const mockCacheLife = cacheLife as jest.MockedFunction<typeof cacheLife>

describe('EventDetailsPage', () => {
  const mockEvent = {
    title: 'React Summit 2025',
    slug: 'react-summit-2025',
    description: 'The biggest React conference',
    overview: 'Comprehensive overview',
    image: 'https://example.com/image.jpg',
    venue: 'Convention Center',
    location: 'Amsterdam',
    date: '2025-06-13',
    time: '09:00',
    mode: 'Hybrid',
    audience: 'Developers',
    agenda: ['Opening Keynote'],
    organizer: 'React Team',
    tags: ['react'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render event details when API call succeeds', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ event: mockEvent }),
    })

    mockGetSimilarEvents.mockResolvedValue([])

    const params = Promise.resolve({ slug: 'react-summit-2025' })
    const result = await EventDetailsPage({ params })
    render(result)

    expect(screen.getByText('React Summit 2025')).toBeInTheDocument()
  })

  it('should call cacheLife with minutes parameter', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ event: mockEvent }),
    })

    mockGetSimilarEvents.mockResolvedValue([])

    const params = Promise.resolve({ slug: 'test-event' })
    await EventDetailsPage({ params })

    expect(mockCacheLife).toHaveBeenCalledWith('minutes')
  })

  it('should call notFound when API returns non-ok response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    })

    const params = Promise.resolve({ slug: 'non-existent' })
    await EventDetailsPage({ params })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should call notFound when event is null', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ event: null }),
    })

    const params = Promise.resolve({ slug: 'test-event' })
    await EventDetailsPage({ params })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should fetch and render similar events', async () => {
    const mockSimilarEvents = [
      {
        id: '2',
        title: 'React Advanced',
        slug: 'react-advanced',
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ event: mockEvent }),
    })

    mockGetSimilarEvents.mockResolvedValue(mockSimilarEvents as any)

    const params = Promise.resolve({ slug: 'react-summit-2025' })
    const result = await EventDetailsPage({ params })
    render(result)

    expect(mockGetSimilarEvents).toHaveBeenCalledWith('react-summit-2025')
    expect(screen.getByText('Similar Events')).toBeInTheDocument()
  })
})