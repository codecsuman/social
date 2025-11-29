import { useEffect, useRef } from 'react'
import ChatPage from './components/ChatPage'
import EditProfile from './components/EditProfile'
import Home from './components/Home'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Signup from './components/Signup'
import ProtectedRoutes from './components/ProtectedRoutes'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { io } from "socket.io-client"
import { useDispatch, useSelector } from 'react-redux'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'


// ✅ ROUTER CONFIG
const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'profile/:id', element: <Profile /> },
      { path: 'account/edit', element: <EditProfile /> },
      { path: 'chat', element: <ChatPage /> },
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
])



function App() {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) return

    // ✅ Prevent duplicate socket creation
    if (socketRef.current) return

    const SOCKET_URL = "http://localhost:3000"

    socketRef.current = io(SOCKET_URL, {
      query: { userId: user._id },
      withCredentials: true,
      transports: ["websocket", "polling"],  // ✅ FIXED
    })

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id)
    })

    socketRef.current.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users))
    })

    socketRef.current.on("notification", (notification) => {
      dispatch(setLikeNotification(notification))
    })

    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket disconnected")
    })

    socketRef.current.on("connect_error", (err) => {
      console.error("⚠ Socket error:", err.message)
    })

    return () => {
      socketRef.current.disconnect()
      socketRef.current = null
    }

  }, [user, dispatch])

  return <RouterProvider router={browserRouter} />
}

export default App
