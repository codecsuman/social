import { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useSelector } from 'react-redux'

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const changeEventHandler = (e) => {
    setInput(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const signupHandler = async (e) => {
    e.preventDefault()

    const username = input.username.trim()
    const email = input.email.trim()
    const password = input.password.trim()

    if (!username || !email || !password) {
      toast.error("All fields are required")
      return
    }

    try {
      setLoading(true)

      const res = await api.post("/api/v1/user/register", {
        username,
        email,
        password
      })

      if (res.data?.success) {
        toast.success(res.data.message || "Account created")
        navigate("/login", { replace: true })
        setInput({ username: "", email: "", password: "" })
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Signup failed"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) navigate("/", { replace: true })
  }, [user, navigate])

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form onSubmit={signupHandler} className="shadow-lg flex flex-col gap-5 p-8">

        <div className="my-4">
          <h1 className="text-center font-bold text-xl">LOGO</h1>
          <p className="text-sm text-center">
            Signup to see photos & videos from your friends
          </p>
        </div>

        <div>
          <span className="font-medium">Username</span>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
            disabled={loading}
            required
          />
        </div>

        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
            disabled={loading}
            required
          />
        </div>

        <div>
          <span className="font-medium">Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
            disabled={loading}
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : "Signup"}
        </Button>

        <span className="text-center text-sm">
          Already have an account?
          <Link to="/login" className="text-blue-600 ml-1">
            Login
          </Link>
        </span>

      </form>
    </div>
  )
}

export default Signup
