import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const Comment = ({ comment }) => {
  if (!comment) return null

  const username = comment?.author?.username || "User"
  const image = comment?.author?.profilePicture || ""
  const initials = username?.charAt(0)?.toUpperCase() || "U"

  return (
    <div className="my-2">
      <div className="flex gap-3 items-center">
        <Avatar>
          <AvatarImage src={image} alt={username} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <h1 className="font-bold text-sm">
          {username}
          <span className="font-normal pl-1">
            {comment?.text || ""}
          </span>
        </h1>
      </div>
    </div>
  )
}

export default Comment
