import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { setSelectedUser } from '@/redux/authSlice'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { MessageCircleCode } from 'lucide-react'
import Messages from './Messages'
import api from '@/lib/api'
import { addMessage } from '@/redux/chatSlice'

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("")
  const { user, suggestedUsers, selectedUser } = useSelector(state => state.auth)
  const { onlineUsers } = useSelector(state => state.chat)
  const dispatch = useDispatch()

  const sendMessageHandler = async () => {
    if (!textMessage.trim() || !selectedUser?._id) return

    try {
      const res = await api.post(`/api/v1/message/send/${selectedUser._id}`, {
        textMessage
      })

      if (res.data?.success) {
        dispatch(addMessage(res.data.newMessage))
        setTextMessage("")
      }
    } catch (error) {
      console.error("Send message error:", error?.response?.data || error.message)
    }
  }

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null))
    }
  }, [dispatch])

  return (
    <div className="flex ml-[16%] h-screen">

      {/* USER LIST */}
      <section className="w-full md:w-1/4 my-8">
        <h1 className="font-bold mb-4 px-3 text-xl">{user?.username}</h1>
        <hr className="mb-4 border-gray-300" />

        <div className="overflow-y-auto h-[80vh]">
          {suggestedUsers?.map((suggestedUser) => {

            const isOnline = onlineUsers?.some(
              id => id === suggestedUser?._id
            )

            return (
              <div
                key={suggestedUser._id}
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage src={suggestedUser?.profilePicture} />
                  <AvatarFallback>
                    {suggestedUser?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <span className="font-medium">{suggestedUser?.username}</span>
                  <span className={`text-xs font-bold ${
                    isOnline ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isOnline ? 'online' : 'offline'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CHAT SECTION */}
      {selectedUser ? (
        <section className="flex-1 border-l border-gray-300 flex flex-col h-full">

          {/* HEADER */}
          <div className="flex gap-3 items-center px-3 py-2 border-b border-gray-300 bg-white sticky top-0 z-10">
            <Avatar>
              <AvatarImage src={selectedUser?.profilePicture} />
              <AvatarFallback>
                {selectedUser?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <span className="font-medium">{selectedUser?.username}</span>
          </div>

          {/* MESSAGES */}
          <Messages selectedUser={selectedUser} />

          {/* INPUT */}
          <div className="flex items-center p-4 border-t border-gray-300">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  sendMessageHandler()
                }
              }}
            />
            <Button onClick={sendMessageHandler}>Send</Button>
          </div>

        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto">
          <MessageCircleCode className="w-32 h-32 my-4" />
          <h1 className="font-medium">Your messages</h1>
          <span>Send a message to start a chat.</span>
        </div>
      )}

    </div>
  )
}

export default ChatPage
