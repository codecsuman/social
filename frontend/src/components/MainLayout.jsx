import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

const MainLayout = () => {
  return (
    <div className="flex">

      {/* Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[16%]">
        <Outlet />
      </div>

    </div>
  )
}

export default MainLayout
