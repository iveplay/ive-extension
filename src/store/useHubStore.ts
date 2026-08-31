import { create } from 'zustand'
import {
  CreateIveEntryData,
  IveEntryWithDetails,
  IveSearchOptions,
} from '@/types/ivedb'
import {
  addToFavorites,
  createEntry,
  deleteEntry,
  getEntriesPaginated,
  getEntryWithDetails,
  getFavorites,
  removeFromFavorites,
  updateEntry,
} from '@/utils/iveDbUtils'

const ENTRIES_PER_PAGE = 20

type HubStore = {
  entries: IveEntryWithDetails[]
  favoriteIds: Set<string>
  loading: boolean
  isLoadingMore: boolean
  error: string | null
  filters: IveSearchOptions
  entriesHasMore: boolean
  setFilters: (filters: IveSearchOptions) => void
  loadEntries: (reset?: boolean) => Promise<void>
  loadMoreEntries: () => Promise<void>
  loadFavorites: () => Promise<void>
  createEntry: (data: CreateIveEntryData) => Promise<string>
  updateEntry: (entryId: string, data: CreateIveEntryData) => Promise<void>
  deleteEntry: (entryId: string) => Promise<void>
  toggleFavorite: (entryId: string) => Promise<void>
}

export const useHubStore = create<HubStore>((set, get) => ({
  entries: [],
  favoriteIds: new Set<string>(),
  loading: false,
  isLoadingMore: false,
  error: null,
  filters: { favorites: false },
  entriesHasMore: true,

  setFilters: (filters) => {
    set({ filters })
    void get().loadEntries(true)
  },

  loadEntries: async (reset = false) => {
    set(reset ? { loading: true, error: null } : { isLoadingMore: true })

    try {
      const { entries, filters } = get()
      const offset = reset ? 0 : entries.length
      const basicEntries = await getEntriesPaginated(
        offset,
        ENTRIES_PER_PAGE,
        filters,
      )
      const detailedEntries = (
        await Promise.all(
          basicEntries.map((entry) => getEntryWithDetails(entry.id)),
        )
      ).filter((entry): entry is IveEntryWithDetails => entry !== null)

      set((state) => ({
        entries: reset
          ? detailedEntries
          : [...state.entries, ...detailedEntries],
        entriesHasMore: basicEntries.length === ENTRIES_PER_PAGE,
      }))
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load entries',
      })
    } finally {
      set({ loading: false, isLoadingMore: false })
    }
  },

  loadMoreEntries: async () => {
    const { entriesHasMore, loading, isLoadingMore } = get()
    if (!entriesHasMore || loading || isLoadingMore) return
    await get().loadEntries(false)
  },

  loadFavorites: async () => {
    try {
      const favorites = await getFavorites()
      set({ favoriteIds: new Set(favorites.map((entry) => entry.id)) })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load favorites',
      })
    }
  },

  createEntry: async (data) => {
    const entryId = await createEntry(data)
    await Promise.all([get().loadEntries(true), get().loadFavorites()])
    return entryId
  },

  updateEntry: async (entryId, data) => {
    await updateEntry(entryId, data)
    await get().loadEntries(true)
  },

  deleteEntry: async (entryId) => {
    await deleteEntry(entryId)
    set((state) => {
      const favoriteIds = new Set(state.favoriteIds)
      favoriteIds.delete(entryId)
      return {
        entries: state.entries.filter(({ entry }) => entry.id !== entryId),
        favoriteIds,
      }
    })
  },

  toggleFavorite: async (entryId) => {
    const isFavorite = get().favoriteIds.has(entryId)
    if (isFavorite) {
      await removeFromFavorites(entryId)
    } else {
      await addToFavorites(entryId)
    }

    set((state) => {
      const favoriteIds = new Set(state.favoriteIds)
      if (isFavorite) {
        favoriteIds.delete(entryId)
      } else {
        favoriteIds.add(entryId)
      }

      return {
        favoriteIds,
        entries:
          state.filters.favorites && isFavorite
            ? state.entries.filter(({ entry }) => entry.id !== entryId)
            : state.entries,
      }
    })
  },
}))
