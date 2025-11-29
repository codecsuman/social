import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './Comment'
import api from '@/lib/api'
import { toast } from 'sonner'
import { setPosts } from '@/redux/postSlice'

const CommentDialog = ({ open, setOpen }) => {

  const [text, setText] = useState("")
  const { selectedPost, posts } = useSelector(state => state.post)
  const [comments, setComments] = useState([])
  const dispatch = useDispatch()

  // ✅ Sync comments from Redux
  useEffect(() => {
    if (!selectedPost?._id) return

    const livePost = posts.find(p => p._id === selectedPost._id)
    if (livePost?.comments) {
      setComments(livePost.comments)
    }
  }, [selectedPost, posts])

  const sendComment = async () => {
    if (!text.trim() || !selectedPost?._id) return

    try {
      const res = await api.post(`/api/v1/post/${selectedPost._id}/comment`, {
        text
      })

      if (res.data?.success) {

        const newComments = [...comments, res.data.comment]
        setComments(newComments)

        const updatedPosts = posts.map(p =>
          p._id === selectedPost._id
            ? { ...p, comments: newComments }
            : p
        )

        dispatch(setPosts(updatedPosts))
        toast.success(res.data.message || "Comment added")
        setText("")
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || "Comment failed")
    }
  }

  if (!selectedPost) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        aria-describedby="comment-dialog-desc"
        className="max-w-5xl p-0 flex flex-col"
      >

        {/* ✅ REQUIRED FOR ACCESSIBILITY */}
        <DialogTitle className="sr-only">Post Comments</DialogTitle>
        <span id="comment-dialog-desc" className="sr-only">
          This dialog shows post comments and allows you to add new ones.
        </span>

        <div className="flex flex-1">

          {/* IMAGE */}
          <div className="w-1/2 bg-black">
            <img
              src={selectedPost.image}
              alt="post"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="w-1/2 flex flex-col justify-between">

            {/* HEADER */}
            <div className="flex items-center justify-between p-4">

              <div className="flex gap-3 items-center">
                <Link to={`/profile/${selectedPost.author._id}`}>
                  <Avatar>
                    <AvatarImage src={selectedPost.author.profilePicture} />
                    <AvatarFallback>
                      {selectedPost.author.username[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <Link
                  to={`/profile/${selectedPost.author._id}`}
                  className="font-semibold text-xs"
                >
                  {selectedPost.author.username}
                </Link>
              </div>

              {/* ✅ FIXED: REMOVE NESTED DIALOG */}
              <MoreHorizontal className="cursor-pointer" />

            </div>

            <hr />

            {/* COMMENTS */}
            <div className="flex-1 overflow-y-auto max-h-96 p-4">
              {comments.length > 0 ? (
                comments.map(c => <Comment key={c._id} comment={c} />)
              ) : (
                <p className="text-gray-400 text-sm text-center">No comments yet</p>
              )}
            </div>

            {/* INPUT */}
            <div className="p-4">
              <div className="flex items-center gap-2">

                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full outline-none border text-sm border-gray-300 p-2 rounded"
                />

                <Button
                  onClick={sendComment}
                  disabled={!text.trim()}
                  variant="outline"
                >
                  Send
                </Button>

              </div>
            </div>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  )
}

export default CommentDialog
