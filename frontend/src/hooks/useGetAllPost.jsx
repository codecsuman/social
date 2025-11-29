import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setPosts } from "../redux/postSlice"
import api from "../lib/api"

const useGetAllPost = () => {
  const dispatch = useDispatch()

  useEffect(() => {

    const fetchAllPost = async () => {
      try {
        const res = await api.get("/api/v1/post/all")
        if (res.data?.success) {
          dispatch(setPosts(res.data.posts || []))
        }
      } catch (error) {
        console.error("Post fetch error:", error?.response?.data || error.message)
      }
    }

    fetchAllPost()

  }, [dispatch])
}

export default useGetAllPost
