import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, BarChart3, User } from 'lucide-react'
import './BottomNav.css'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {links.map(link => (
        <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <link.icon className="nav-icon" />
          <span className="nav-label">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
