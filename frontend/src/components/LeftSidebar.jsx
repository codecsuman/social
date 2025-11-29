import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { setSocket } from '@/redux/socketSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'

const LeftSidebar = () => {

  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const { likeNotification } = useSelector(state => state.realTimeNotification || {})
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)

  const logoutHandler = async () => {
    try {
      const res = await api.get("/api/v1/user/logout")

      if (res.data?.success) {
        dispatch(setAuthUser(null))
        dispatch(setSelectedPost(null))
        dispatch(setPosts([]))
        dispatch(setSocket(null))      // ✅ clear socket
        navigate("/login", { replace: true })
        toast.success(res.data.message || "Logged out")
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed")
    }
  }

  const sidebarHandler = (type) => {
    switch (type) {
      case "Logout":
        logoutHandler()
        break
      case "Create":
        setOpen(true)
        break
      case "Profile":
        navigate(`/profile/${user?._id}`)
        break
      case "Home":
        navigate("/")
        break
      case "Messages":
        navigate("/chat")
        break
      default:
        break
    }
  }

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>
            {user?.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ]

  return (
    <div className="fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen bg-white">
      <div className="flex flex-col">
        <h1 className="my-8 pl-3 font-bold text-xl">LOGO</h1>

        <div>
          {sidebarItems.map((item, index) => {

            const isNotification = item.text === "Notifications"

            return (
              <div
                key={index}
                onClick={() => !isNotification && sidebarHandler(item.text)}
                className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
              >
                {item.icon}
                <span>{item.text}</span>

                {/* 🔔 NOTIFICATIONS */}
                {isNotification && likeNotification?.length > 0 && (

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full h-5 w-5 bg-red-600 absolute bottom-6 left-6 hover:bg-red-600"
                      >
                        {likeNotification.length}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-64"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {likeNotification.length === 0 ? (
                        <p className="text-sm">No new notification</p>
                      ) : (
                        likeNotification.map((notification) => (
                          <div
                            key={notification.userId}
                            className="flex items-center gap-2 my-2"
                          >
                            <Avatar>
                              <AvatarImage src={notification.userDetails?.profilePicture} />
                              <AvatarFallback>
                                {notification.userDetails?.username?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm">
                              <span className="font-bold">
                                {notification.userDetails?.username}
                              </span> liked your post
                            </p>
                          </div>
                        ))
                      )}
                    </PopoverContent>
                  </Popover>
                )}

              </div>
            )
          })}
        </div>
      </div>

      <CreatePost open={open} setOpen={setOpen} />
    </div>
  )
}

export default LeftSidebar
