import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setUserProfile } from "../redux/authSlice"
import api from "../lib/api"

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!userId) return

    const controller = new AbortController()

    const fetchUserProfile = async () => {
      try {
        const res = await api.get(`/api/v1/user/${userId}/profile`, {
          signal: controller.signal,
        })

        if (res.data?.success) {
          dispatch(setUserProfile(res.data.user))
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error(
            "Profile fetch error:",
            error?.response?.data || error.message
          )
        }
      }
    }

    fetchUserProfile()

    return () => controller.abort()
  }, [userId, dispatch])
}

export default useGetUserProfile
