import { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'

const Login = () => {
  const [input, setInput] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)

  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const changeEventHandler = (e) => {
    setInput(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const loginHandler = async (e) => {
    e.preventDefault()

    if (!input.email.trim() || !input.password.trim()) {
      toast.error("Email and password are required")
      return
    }

    try {
      setLoading(true)

      const res = await api.post("/api/v1/user/login", {
        email: input.email.trim(),
        password: input.password.trim()
      })

      if (res.data?.success) {
        dispatch(setAuthUser(res.data.user))
        toast.success(res.data.message || "Login successful")
        navigate("/", { replace: true })
        setInput({ email: "", password: "" })
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed"
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
      <form onSubmit={loginHandler} className="shadow-lg flex flex-col gap-5 p-8">
        <div className="my-4">
          <h1 className="text-center font-bold text-xl">LOGO</h1>
          <p className="text-sm text-center">
            Login to see photos & videos from your friends
          </p>
        </div>

        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
            required
            disabled={loading}
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
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : "Login"}
        </Button>

        <span className="text-center text-sm">
          Doesn’t have an account?
          <Link to="/signup" className="text-blue-600 ml-1">
            Signup
          </Link>
        </span>
      </form>
    </div>
  )
}

export default Login
