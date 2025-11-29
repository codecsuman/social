import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRTM from '@/hooks/useGetRTM'

const Messages = ({ selectedUser }) => {

  // ✅ Correct usage of hooks (always at top)
  useGetAllMessage(selectedUser?._id)
  useGetRTM()

  const { messages } = useSelector(state => state.chat)
  const { user } = useSelector(state => state.auth)

  return (
    <div className="overflow-y-auto flex-1 p-4">

      {/* HEADER */}
      <div className="flex justify-center mb-3">
        <div className="flex flex-col items-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
            <AvatarFallback>
              {selectedUser?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <span className="font-medium">{selectedUser?.username}</span>

          <Link to={`/profile/${selectedUser?._id}`}>
            <Button variant="secondary" className="h-8 my-2">
              View profile
            </Button>
          </Link>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex flex-col gap-3">
        {messages?.map((msg) => {
          const isMine = msg?.senderId === user?._id

          return (
            <div
              key={msg._id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-2 rounded-lg max-w-xs break-words ${
                  isMine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                {msg?.message || ""}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default Messages
