import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface AppState {
  theme: "light" | "dark" | "system"
  sidebarOpen: boolean
}

const initialState: AppState = {
  theme: "system",
  sidebarOpen: true,
}

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<AppState["theme"]>) => {
      state.theme = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
  },
})

export const { setTheme, toggleSidebar } = appSlice.actions
export default appSlice.reducer
