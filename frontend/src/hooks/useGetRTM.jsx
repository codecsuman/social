import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addMessage } from "../redux/chatSlice"

const useGetRTM = () => {
  const dispatch = useDispatch()
  const { socket } = useSelector(state => state.socketio)

  useEffect(() => {
    if (!socket) return

    const handleMessage = (newMessage) => {
      dispatch(addMessage(newMessage))
    }

    socket.on("newMessage", handleMessage)

    return () => {
      socket.off("newMessage", handleMessage)
    }

  }, [socket, dispatch])
}

export default useGetRTM
