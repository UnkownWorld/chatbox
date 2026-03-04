import { createStore } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import { safeStorage } from './safeStorage'

type State = {
  chat?: {
    provider: string
    modelId: string
  }
  picture?: {
    provider: string
    modelId: string
  }
}

export const lastUsedModelStore = createStore(
  persist(
    combine(
      {
        chat: undefined,
        picture: undefined,
      } as State,
      (set) => ({
        setChatModel: (provider: string, modelId: string) => {
          set({
            chat: {
              provider,
              modelId,
            },
          })
        },
        setPictureModel: (provider: string, modelId: string) => {
          set({
            picture: {
              provider,
              modelId,
            },
          })
        },
      })
    ),
    {
      name: 'last-used-model',
      version: 0,
      skipHydration: true,
      storage: safeStorage,
    }
  )
)

let initLastUsedModelStorePromise: Promise<State> | undefined
export const initLastUsedModelStore = async () => {
  if (!initLastUsedModelStorePromise) {
    initLastUsedModelStorePromise = new Promise<State>((resolve) => {
      // 添加超时保护
      const timeout = setTimeout(() => {
        console.warn('[lastUsedModelStore] init timeout, resolving with current state')
        resolve(lastUsedModelStore.getState() as State)
      }, 5000) // 5秒超时

      const unsub = lastUsedModelStore.persist.onFinishHydration((val) => {
        clearTimeout(timeout)
        unsub()
        resolve(val)
      })
      lastUsedModelStore.persist.rehydrate()
    })
  }
  return initLastUsedModelStorePromise
}
