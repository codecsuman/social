import { Conversation } from "../models/conversation.model.js"
import { Message } from "../models/message.model.js"
import { getReceiverSocketId, getIO } from "../socket/socket.js";


// ✅ SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id
    const receiverId = req.params.id
    const { textMessage } = req.body

    if (!textMessage || !textMessage.trim()) {
      return res.status(400).json({ success: false, message: "Message is empty" })
    }

    // ✅ Find conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    })

    // ✅ Create if not exists
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: []
      })
    }

    // ✅ Create message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: textMessage
    })

    conversation.messages.push(newMessage._id)
    await conversation.save()

    // ✅ SEND REALTIME MESSAGE
    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage)
    }

    return res.status(201).json({
      success: true,
      newMessage
    })

  } catch (error) {
    console.error("❌ Send message error:", error.message)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}


// ✅ GET ALL MESSAGES
export const getMessage = async (req, res) => {
  try {
    const senderId = req.id
    const receiverId = req.params.id

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate("messages")

    if (!conversation) {
      return res.status(200).json({ success: true, messages: [] })
    }

    return res.status(200).json({
      success: true,
      messages: conversation.messages
    })

  } catch (error) {
    console.error("❌ Fetch messages error:", error.message)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}
