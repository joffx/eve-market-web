import { create } from "zustand"

import type { RoutePreference, SystemOption } from "@/lib/api/client"

type MapStore = {
  originText: string
  destinationText: string
  originSystem: SystemOption | null
  destinationSystem: SystemOption | null
  preference: RoutePreference
  setOriginText: (value: string) => void
  setDestinationText: (value: string) => void
  setOriginSystem: (system: SystemOption | null) => void
  setDestinationSystem: (system: SystemOption | null) => void
  setPreference: (preference: RoutePreference) => void
}

export const useMapStore = create<MapStore>((set) => ({
  originText: "Jita",
  destinationText: "Amarr",
  originSystem: {
    systemId: 30000142,
    name: "Jita",
    region: "The Forge",
  },
  destinationSystem: {
    systemId: 30002187,
    name: "Amarr",
    region: "Domain",
  },
  preference: "secure",
  setOriginText: (originText) => set({ originText, originSystem: null }),
  setDestinationText: (destinationText) =>
    set({ destinationText, destinationSystem: null }),
  setOriginSystem: (originSystem) =>
    set({
      originSystem,
      originText: originSystem?.name ?? "",
    }),
  setDestinationSystem: (destinationSystem) =>
    set({
      destinationSystem,
      destinationText: destinationSystem?.name ?? "",
    }),
  setPreference: (preference) => set({ preference }),
}))
