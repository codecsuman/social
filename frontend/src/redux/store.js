import { combineReducers, configureStore } from "@reduxjs/toolkit"
import authSlice from "./authSlice.js"
import postSlice from "./postSlice.js"
import socketSlice from "./socketSlice.js"
import chatSlice from "./chatSlice.js"
import rtnSlice from "./rtnSlice.js"

import { 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist"

import storage from "redux-persist/lib/storage"

// ✅ Persist only safe data (NOT socket)
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth", "chat", "post"],  // ✅ DO NOT persist socket
}

const rootReducer = combineReducers({
  auth: authSlice,
  post: postSlice,
  chat: chatSlice,
  realTimeNotification: rtnSlice,
  socketio: socketSlice, // NOT persisted now
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER
        ],
      },
    }),
})

export default store
