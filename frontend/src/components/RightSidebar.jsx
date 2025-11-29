import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import SuggestedUsers from './SuggestedUsers'

const RightSidebar = () => {
  const { user } = useSelector(state => state.auth)

  if (!user) return null

  return (
    <div className="w-fit my-10 pr-32 hidden lg:block">

      <div className="flex items-center gap-2">
        <Link to={`/profile/${user._id}`}>
          <Avatar>
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback>
              {user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div>
          <h1 className="font-semibold text-sm">
            <Link to={`/profile/${user._id}`}>
              {user.username}
            </Link>
          </h1>
          <span className="text-gray-600 text-sm">
            {user.bio || 'Bio here...'}
          </span>
        </div>
      </div>

      <SuggestedUsers />

    </div>
  )
}

export default RightSidebar
