import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { AtSign, Heart, MessageCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { setAuthUser } from '@/redux/authSlice'

const Profile = () => {
  const { id } = useParams()
  const dispatch = useDispatch()

  const { userProfile, user } = useSelector(store => store.auth)
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(false)

  useGetUserProfile(id)

  const isLoggedInUserProfile = user?._id === userProfile?._id
  const isFollowing = userProfile?.followers?.includes(user?._id)

  const displayedPost =
    activeTab === 'posts'
      ? userProfile?.posts || []
      : userProfile?.bookmarks || []


  // ✅ Follow / Unfollow
  const handleFollow = async () => {
    try {
      setLoading(true)
      const res = await api.post(`/api/v1/user/followorunfollow/${userProfile._id}`)

      if (res.data.success) {
        toast.success(res.data.message)

        // ✅ Refetch profile after follow
        useGetUserProfile(id)

        // ✅ update auth user (followers list)
        dispatch(setAuthUser(res.data.currentUser))
      }

    } catch (error) {
      toast.error("Follow error")
    } finally {
      setLoading(false)
    }
  }


  if (!userProfile) {
    return <div className="text-center mt-10">Loading profile...</div>
  }


  return (
    <div className="flex max-w-5xl justify-center mx-auto pl-10">

      <div className="flex flex-col gap-20 p-8">

        <div className="grid grid-cols-2">

          {/* Avatar */}
          <section className="flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={userProfile.profilePicture} />
              <AvatarFallback>
                {userProfile.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </section>


          {/* Profile Info */}
          <section>
            <div className="flex flex-col gap-5">

              <div className="flex items-center gap-2">
                <span className="font-medium">{userProfile.username}</span>

                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button variant="secondary" className="h-8">Edit profile</Button>
                    </Link>
                    <Button variant="secondary" className="h-8">Archive</Button>
                  </>
                ) : (
                  <Button
                    onClick={handleFollow}
                    disabled={loading}
                    className={isFollowing ? "h-8" : "bg-[#0095F6] hover:bg-[#3192d2] h-8"}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <p><b>{userProfile.posts?.length || 0}</b> posts</p>
                <p><b>{userProfile.followers?.length || 0}</b> followers</p>
                <p><b>{userProfile.following?.length || 0}</b> following</p>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{userProfile.bio || "No bio"}</span>

                <Badge className="w-fit" variant="secondary">
                  <AtSign className="h-4 w-4" />
                  <span className="pl-1">{userProfile.username}</span>
                </Badge>
              </div>

            </div>
          </section>
        </div>


        {/* Tabs */}
        <div className="border-t border-t-gray-200">

          <div className="flex items-center justify-center gap-10 text-sm">

            <span
              className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              POSTS
            </span>

            <span
              className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              SAVED
            </span>

          </div>


          {/* POSTS GRID */}
          <div className="grid grid-cols-3 gap-1">

            {displayedPost.map((post) => (

              <div key={post._id} className="relative group cursor-pointer">

                <img
                  src={post.image}
                  alt="post"
                  className="rounded-sm my-2 w-full aspect-square object-cover"
                />

                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition">

                  <div className="flex items-center text-white space-x-4">
                    <div className="flex items-center gap-2">
                      <Heart />
                      <span>{post.likes?.length || 0}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageCircle />
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>

                </div>

              </div>

            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile
