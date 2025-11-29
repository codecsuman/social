import { createSlice } from "@reduxjs/toolkit"

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    onlineUsers: [],
    messages: [],
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload
    },

    setMessages: (state, action) => {
      state.messages = action.payload   // full replace
    },

    addMessage: (state, action) => {
      state.messages.push(action.payload)   // realtime update
    },
  },
})

export const { setOnlineUsers, setMessages, addMessage } = chatSlice.actions
export default chatSlice.reducer
