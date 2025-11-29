import { createSlice } from "@reduxjs/toolkit"

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    likeNotification: [],
  },
  reducers: {
    setLikeNotification: (state, action) => {
      if (!action.payload) return

      const { type, userId } = action.payload

      // ✅ Add new like notification
      if (type === "like") {
        const exists = state.likeNotification.find(
          item => item.userId === userId
        )
        if (!exists) {
          state.likeNotification.push(action.payload)
        }
      }

      // ✅ Remove notification on dislike
      if (type === "dislike") {
        state.likeNotification = state.likeNotification.filter(
          item => item.userId !== userId
        )
      }
    }
  }
})

export const { setLikeNotification } = rtnSlice.actions
export default rtnSlice.reducer
