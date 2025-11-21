import { getSimilarEventsBySlug } from '../event.actions'
import Event from '@/database/event.model'
import connectDB from '@/lib/mongodb'

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@/database/event.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    find: jest.fn(),
  },
}))

describe('getSimilarEventsBySlug', () => {
  const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>
  const mockEventFindOne = Event.findOne as jest.MockedFunction<typeof Event.findOne>
  const mockEventFind = Event.find as jest.MockedFunction<typeof Event.find>

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return similar events based on matching tags', async () => {
    const mockEvent = {
      _id: 'event-1',
      slug: 'react-summit-2025',
      title: 'React Summit 2025',
      tags: ['react', 'javascript', 'frontend'],
    }

    const mockSimilarEvents = [
      {
        _id: 'event-2',
        slug: 'react-conf-2025',
        title: 'React Conf 2025',
        tags: ['react', 'javascript'],
      },
    ]

    mockConnectDB.mockResolvedValue(undefined)
    mockEventFindOne.mockResolvedValue(mockEvent)
    mockEventFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockSimilarEvents),
    } as any)

    const result = await getSimilarEventsBySlug('react-summit-2025')

    expect(mockConnectDB).toHaveBeenCalledTimes(1)
    expect(mockEventFindOne).toHaveBeenCalledWith({ slug: 'react-summit-2025' })
    expect(result).toEqual(mockSimilarEvents)
  })

  it('should use lean() for serialization', async () => {
    const mockEvent = {
      _id: 'event-1',
      slug: 'test-event',
      tags: ['test'],
    }

    const mockLean = jest.fn().mockResolvedValue([])
    mockConnectDB.mockResolvedValue(undefined)
    mockEventFindOne.mockResolvedValue(mockEvent)
    mockEventFind.mockReturnValue({ lean: mockLean } as any)

    await getSimilarEventsBySlug('test-event')

    expect(mockLean).toHaveBeenCalled()
  })

  it('should return empty array when event not found', async () => {
    mockConnectDB.mockResolvedValue(undefined)
    mockEventFindOne.mockResolvedValue(null)

    const result = await getSimilarEventsBySlug('non-existent-slug')

    expect(result).toEqual([])
    expect(console.error).toHaveBeenCalled()
  })

  it('should return empty array on database error', async () => {
    mockConnectDB.mockRejectedValue(new Error('Connection failed'))

    const result = await getSimilarEventsBySlug('test-slug')

    expect(result).toEqual([])
    expect(console.error).toHaveBeenCalled()
  })

  it('should exclude current event from results', async () => {
    const mockEvent = {
      _id: 'event-1',
      slug: 'test-event',
      tags: ['test'],
    }

    mockConnectDB.mockResolvedValue(undefined)
    mockEventFindOne.mockResolvedValue(mockEvent)
    mockEventFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    } as any)

    await getSimilarEventsBySlug('test-event')

    expect(mockEventFind).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: { $ne: 'event-1' },
      })
    )
  })
})