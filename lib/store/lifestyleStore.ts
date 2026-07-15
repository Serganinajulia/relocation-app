import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LifeStyle, resolveOverrides } from '@/lib/calc/formulas'

export type CustomLifestyle = {
  id: string
  name: string
  values: ReturnType<typeof resolveOverrides>
}

type LifestyleStore = {
  customLifestyles: CustomLifestyle[]
  selectedCustomId: string | null

  addOrUpdateCustomLifestyle: (cl: CustomLifestyle) => void
  removeCustomLifestyle: (id: string) => void
  selectCustom: (id: string | null) => void
}

export const useLifestyleStore = create<LifestyleStore>()(
  persist(
    (set) => ({
      customLifestyles: [],
      selectedCustomId: null,

      addOrUpdateCustomLifestyle: (cl) => set((state) => {
        const exists = state.customLifestyles.some(c => c.id === cl.id)
        return {
          customLifestyles: exists
            ? state.customLifestyles.map(c => c.id === cl.id ? cl : c)
            : [...state.customLifestyles, cl],
        }
      }),

      removeCustomLifestyle: (id) => set((state) => ({
        customLifestyles: state.customLifestyles.filter(c => c.id !== id),
        selectedCustomId: state.selectedCustomId === id ? null : state.selectedCustomId,
      })),

      selectCustom: (id) => set({ selectedCustomId: id }),
    }),
    {
      name: 'relocalc-custom-lifestyles', // ключ в localStorage
    }
  )
)