import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setSuggestedUsers } from "../redux/authSlice"
import api from "../lib/api"

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch()

  useEffect(() => {

    const fetchSuggestedUsers = async () => {
      try {
        const res = await api.get("/api/v1/user/suggested")
        if (res.data?.success) {
          dispatch(setSuggestedUsers(res.data.users || []))
        }
      } catch (error) {
        console.error("Suggested users fetch error:", error?.response?.data || error.message)
      }
    }

    fetchSuggestedUsers()

  }, [dispatch])
}

export default useGetSuggestedUsers
