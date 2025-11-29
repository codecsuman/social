import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa"
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import api from '@/lib/api'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'

const Post = ({ post }) => {

  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { posts } = useSelector(state => state.post)

  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)

  const [liked, setLiked] = useState((post.likes || []).includes(user?._id))
  const [postLike, setPostLike] = useState(post.likes?.length || 0)
  const [comments, setComments] = useState(post.comments || [])

  // ✅ Sync local state when Redux updates
  useEffect(() => {
    setLiked((post.likes || []).includes(user?._id))
    setPostLike(post.likes?.length || 0)
    setComments(post.comments || [])
  }, [post.likes, post.comments, user?._id])

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? 'dislike' : 'like'
      const res = await api.get(`/api/v1/post/${post._id}/${action}`)

      if (res.data?.success) {

        const updatedPostData = posts.map(p =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter(id => id !== user._id)
                  : [...p.likes, user._id]
              }
            : p
        )

        dispatch(setPosts(updatedPostData))
      }
    } catch (error) {
      toast.error("Like failed")
    }
  }

  const commentHandler = async () => {
    if (!text.trim()) return

    try {
      const res = await api.post(`/api/v1/post/${post._id}/comment`, { text })

      if (res.data?.success) {

        const updatedPostData = posts.map(p =>
          p._id === post._id
            ? { ...p, comments: [...p.comments, res.data.comment] }
            : p
        )

        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message || "Comment added")
        setText("")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Comment failed")
    }
  }

  const deletePostHandler = async () => {
    try {
      const res = await api.delete(`/api/v1/post/delete/${post._id}`)

      if (res.data?.success) {
        const updatedPostData = posts.filter(p => p._id !== post._id)
        dispatch(setPosts(updatedPostData))
        setOpen(false)
        toast.success(res.data.message || "Post deleted")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed")
    }
  }

  const bookmarkHandler = async () => {
    try {
      const res = await api.get(`/api/v1/post/${post._id}/bookmark`)
      if (res.data?.success) toast.success(res.data.message)
    } catch (error) {
      toast.error("Bookmark failed")
    }
  }

  return (
    <div className="my-8 w-full max-w-sm mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>
              {post.author?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2">
            <h1 className="font-medium">{post.author?.username}</h1>
            {user?._id === post.author?._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>

          <DialogContent className="flex flex-col items-center text-sm text-center">

            {post.author?._id !== user?._id && (
              <Button variant="ghost" className="text-[#ED4956] font-bold">
                Unfollow
              </Button>
            )}

            <Button variant="ghost">Add to favorites</Button>

            {user?._id === post.author?._id && (
              <Button
                onClick={deletePostHandler}
                variant="ghost"
                className="text-red-500"
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>

      </div>

      {/* IMAGE */}
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image || "https://via.placeholder.com/300"}
        alt="post"
      />

      {/* ACTION BAR */}
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">

          {liked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              size={24}
              className="cursor-pointer text-red-600"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikeHandler}
              size={22}
              className="cursor-pointer hover:text-gray-600"
            />
          )}

          <MessageCircle
            className="cursor-pointer hover:text-gray-600"
            onClick={() => {
              dispatch(setSelectedPost(post))
              setOpen(true)
            }}
          />

          <Send className="cursor-pointer hover:text-gray-600" />
        </div>

        <Bookmark
          onClick={bookmarkHandler}
          className="cursor-pointer hover:text-gray-600"
        />
      </div>

      <span className="font-medium block mb-2">
        {postLike} likes
      </span>

      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.caption}
      </p>

      {(post.comments?.length || 0) > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post))
            setOpen(true)
          }}
          className="cursor-pointer text-sm text-gray-400"
        >
          View all {post.comments.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />

      {/* COMMENT INPUT */}
      <div className="flex items-center justify-between mt-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="outline-none text-sm w-full"
        />

        {text.trim() && (
          <span
            onClick={commentHandler}
            className="text-[#3BADF8] cursor-pointer ml-2"
          >
            Post
          </span>
        )}
      </div>

    </div>
  )
}

export default Post
