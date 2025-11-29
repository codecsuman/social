import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import api from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { setAuthUser } from '@/redux/authSlice'

const EditProfile = () => {
  const imageRef = useRef(null)
  const { user } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState({
    profilePhoto: null,
    bio: user?.bio || "",
    gender: user?.gender || ""
  })

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ✅ Validate image
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }

    setInput(prev => ({ ...prev, profilePhoto: file }))
  }

  const selectChangeHandler = (value) => {
    setInput(prev => ({ ...prev, gender: value }))
  }

  const editProfileHandler = async () => {

    if (
      !input.profilePhoto &&
      input.bio === user?.bio &&
      input.gender === user?.gender
    ) {
      toast.error("No changes detected")
      return
    }

    const formData = new FormData()
    formData.append("bio", input.bio)
    formData.append("gender", input.gender)
    if (input.profilePhoto) formData.append("profilePhoto", input.profilePhoto)

    try {
      setLoading(true)

      const res = await api.post("/api/v1/user/profile/edit", formData) // ✅ removed header

      if (res.data?.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user?.gender
        }

        dispatch(setAuthUser(updatedUserData))
        toast.success(res.data.message || "Profile updated")
        navigate(`/profile/${user?._id}`, { replace: true })
      }

    } catch (error) {
      console.error("Update error:", error)
      toast.error(error?.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex max-w-2xl mx-auto pl-10">
      <section className="flex flex-col gap-6 w-full my-8">
        <h1 className="font-bold text-xl">Edit Profile</h1>

        {/* USER HEADER */}
        <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="font-bold text-sm">{user?.username}</h1>
              <span className="text-gray-600">
                {user?.bio || "Bio here..."}
              </span>
            </div>
          </div>

          <input
            ref={imageRef}
            onChange={fileChangeHandler}
            type="file"
            hidden
            accept="image/*"
          />

          <Button
            onClick={() => imageRef.current.click()}
            className="bg-[#0095F6] h-8 hover:bg-[#318bc7]"
          >
            Change photo
          </Button>
        </div>

        {/* BIO */}
        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <Textarea
            value={input.bio}
            onChange={(e) =>
              setInput(prev => ({ ...prev, bio: e.target.value }))
            }
            className="focus-visible:ring-transparent"
            placeholder="Write something about yourself..."
          />
        </div>

        {/* GENDER */}
        <div>
          <h1 className="font-bold mb-2">Gender</h1>
          <Select value={input.gender} onValueChange={selectChangeHandler}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          {loading ? (
            <Button disabled className="w-fit bg-[#0095F6]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd]"
            >
              Submit
            </Button>
          )}
        </div>

      </section>
    </div>
  )
}

export default EditProfile
