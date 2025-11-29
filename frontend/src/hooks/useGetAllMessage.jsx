import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setMessages } from "../redux/chatSlice"
import api from "../lib/api"

const useGetAllMessage = (userId) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!userId) return   // ✅ guard lives inside hook

    const controller = new AbortController()

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/v1/message/${userId}`, {
          signal: controller.signal,
        })

        if (res.data?.success) {
          dispatch(setMessages(res.data.messages || []))
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Message fetch error:", error?.response?.data || error.message)
        }
      }
    }

    fetchMessages()
    return () => controller.abort()

  }, [dispatch, userId])
}

export default useGetAllMessage
