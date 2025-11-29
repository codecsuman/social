import { useSelector } from "react-redux"
import Post from "./Post"

const Posts = () => {
  const { posts } = useSelector((store) => store.post)

  if (!posts?.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        No posts yet. Start following people!
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">

      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}

    </div>
  )
}

export default Posts
