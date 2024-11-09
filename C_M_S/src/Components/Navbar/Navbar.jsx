import React, { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, Columns2, MessageSquare, MessagesSquare, BookMarked, GraduationCap, CalendarCheck, FilePen, CreditCard, Settings, PencilRuler, Users, FileText, BookOpen, MessageCircle, School, DollarSign, LogOut, User } from 'lucide-react'
import avatar2 from "../../assets/avatar_2.png"
import { FaChalkboard, FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaPlusCircle, FaEye, FaEdit, FaSpinner, FaCheckCircle, FaQuestion } from 'react-icons/fa';
import { FaRegCreditCard } from "react-icons/fa6";
import { VscFeedback } from "react-icons/vsc";
import { MdOutlineDashboard, MdAssignment, MdOutlineFormatListBulleted } from "react-icons/md";
const navItemsByRole = {
  student: [
    {
      id: 1, label: 'Dashboard', href: '/student/dashboard/overview', icon: MdOutlineFormatListBulleted, children: [
        { label: 'Overview', href: '/student/dashboard/overview', icon: MdOutlineDashboard },
        { label: 'Inbox', href: '/student/dashboard/notifications', icon: MessageSquare },
        { label: 'Fees', href: '/student/dashboard/fees', icon: FaRegCreditCard },
      ]
    },
    {
      id: 2, label: 'Courses', href: '/student/courses/enrolled-courses', icon: BookOpen, children: [
        { label: 'Enrolled Courses', href: '/student/courses/enrolled-courses', icon: BookMarked },
        { label: 'Attendance', href: '/student/courses/attendance', icon: CalendarCheck },
        { label: 'Course Forum', href: '/student/courses/course-forum', icon: MessagesSquare},
        { label: 'Assignments', href: '/student/courses/assignments', icon: MdAssignment },
        { label: 'Quiz', href: '/student/courses/quiz', icon: FilePen },
        { label: 'Results', href: '/student/courses/results', icon: GraduationCap },
      ]
    },
    { id: 3, label: 'Community', href: '/community', icon: Users },
  ],
  faculty: [
    {
      id: 1, label: 'Dashboard', href: '/dashboard', icon: Columns2, children: [
        { label: 'Profile', href: '/profile', icon: Users },
        { label: 'Settings', href: '/settings', icon: Users }
      ]
    },
    {
      id: 2, label: 'Classes', href: '/classes', icon: School, children: [
        { label: 'Manage Classes', href: '/manage-classes', icon: Users },
        { label: 'Grades', href: '/grades', icon: Users },
        { label: 'Schedule', href: '/schedule', icon: Users }
      ]
    },
    {
      id: 3, label: 'Faculty Forum', href: '/forum', icon: MessageCircle, children: [
        { label: 'Posts', href: '/posts', icon: Users },
        { label: 'Topics', href: '/topics', icon: Users },
        { label: 'Notifications', href: '/notifications', icon: Users }
      ]
    }
  ],
  'master-admin': [
    {
      id: 1, label: 'Dashboard', href: '/dashboard', icon: Columns2, children: [
        { label: 'Overview', href: '/admin_dashboard', icon: Users },
        { label: 'Settings', href: '/settings', icon: Users }
      ]
    },
    {
      id: 2, label: 'Users', href: '/users', icon: Users, children: [
        { label: 'Manage Users', href: '/manage-users', icon: Users },
        { label: 'Permissions', href: '/permissions', icon: Users }
      ]
    },
    { id: 3, label: 'Reports', href: '/reports', icon: FileText },
    { id: 4, label: 'System Settings', href: '/system-settings', icon: Settings }
  ],
  'academic-admin': [
    {
      id: 1, label: 'Dashboard', href: '/academic-admin', icon: Columns2, children: [
        { label: 'Overview', href: '/academic-admin', icon: MdOutlineDashboard },
        { label: 'Community', href: '/academic-admin/Community', icon: FaChalkboard },
      ]
    },
    {
      id: 2, label: 'User Management', href: '/academic-admin/user_management/student', icon: Users, children: [
        { label: 'Student', href: '/academic-admin/user_management/student', icon: FaUserGraduate },
        { label: 'Faculty', href: '/academic-admin/user_management/faculty', icon: FaChalkboardTeacher },
        { label: 'TAs', href: '/academic-admin/user_management/ta', icon: FaUserTie }
      ]
    },
    {
      id: 3, label: 'Course Management', href: '/academic-admin/course_management/viewcourse', icon: BookOpen, children: [
        { label: 'View Course', href: '/academic-admin/course_management/viewcourse', icon: FaEye },
        { label: 'Add Course', href: '/academic-admin/course_management/addcourse', icon: FaPlusCircle }
      ]
    },
    {
      id: 4, label: 'Feedback', href: '/academic-admin/feedback/ongoing', icon: FileText, children: [
        { label: 'Ongoing Feedback', href: '/academic-admin/feedback/ongoing', icon: FaSpinner },
        { label: 'Create Feedback', href: '/academic-admin/feedback/add', icon: FaEdit },
        { label: 'Completed Feedback', href: '/academic-admin/feedback/completed', icon: FaCheckCircle },
        { label: 'Responsed Feedback', href: '/academic-admin/feedback/answer', icon: VscFeedback },
        { label: 'Questions', href: '/academic-admin/feedback/question', icon: FaQuestion },
      ]
    }
  ],
  'finance-admin': [
    { id: 1, label: 'Dashboard', href: '/dashboard', icon: Columns2 },
    { id: 2, label: 'Financial Overview', href: '/financial-overview', icon: DollarSign },
    { id: 3, label: 'Student Fees', href: '/student-fees', icon: CreditCard },
    { id: 4, label: 'Financial Reports', href: '/financial-reports', icon: FileText }
  ]
}

export default function Navbar({ role = '' }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [navRole, setNavRole] = useState(); 
  const [navItems, setNavItems] = useState(navItemsByRole[navRole] || [])
  const [activeMainLink, setActiveMainLink] = useState(navItems[0]?.id)
  const [activeChildLink, setActiveChildLink] = useState('')
  const [firstName, setFirstName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isTA, setIsTA] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const toggleDropdown = (id) => {
    setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleNavigation = (href) => {
    navigate(href)
    setIsSidebarOpen(false)
  }

  const handleMainLinkClick = (id, href) => {
    setActiveMainLink(id)
    navigate(href)
  }

  const handleLogoutConfirm = () => {
    localStorage.clear()
    navigate('/')
    window.location.reload()
  }
  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true)
    setIsProfileDropdownOpen(false)
  }
  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false)
  }
  useEffect(() => {
    const fetchUserData = () => {
      const storedFirstName = localStorage.getItem('firstName')
      const storedImageUrl = localStorage.getItem('imageUrl')
      const storedIsTA = localStorage.getItem('isTA')
      const storedUserRole = localStorage.getItem('userRole').toString()

      if (storedUserRole) setNavRole(storedUserRole); 
      if (storedUserRole === 'academic-admin') {
        setFirstName('Academic Admin')
      }
      else if (storedUserRole === 'master-admin') {
        setFirstName('master Admin')
      }
      else if (storedUserRole === 'finance-admin') {
        setFirstName('finance Admin')
      }
      else {
        if (storedFirstName) setFirstName(storedFirstName)
      }
      if (storedImageUrl) setImageUrl(storedImageUrl)
      if (storedIsTA) setIsTA(JSON.parse(storedIsTA))

      const currentPath = location.pathname
      const currentMainLink = navItems.find(item =>
        item.href === currentPath ||
        (item.children && item.children.some(child => child.href === currentPath))
      )
      if (currentMainLink) {
        setActiveMainLink(currentMainLink.id)
        const activeChild = currentMainLink.children?.find(child => child.href === currentPath)
        setActiveChildLink(activeChild ? activeChild.href : '')
      }
    }

    fetchUserData()
    const intervalId = setInterval(fetchUserData, 5000)
    return () => clearInterval(intervalId)
  }, [location, navItems])

  
  useEffect(() => {
    if (navRole) {
      setNavItems(navItemsByRole[navRole] || [])
    }
  }, [navRole])

  useEffect(() => {
    if (role === 'student' && isTA) {
      setNavItems([...navItemsByRole.student, { id: 4, label: 'TA', href: '/ta', icon: PencilRuler }])
    } else {
      setNavItems(navItemsByRole[role] || [])
    }
  }, [role, isTA])

  useEffect(() => {
    const currentMainLink = navItems.find(item =>
      item.href === location.pathname ||
      (item.children && item.children.some(child => child.href === location.pathname))
    )
    if (currentMainLink) {
      setActiveMainLink(currentMainLink.id)
    }
  }, [location, navItems])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileDropdownOpen])
  // Define role-based routes for profile, settings, and notifications
  const roleBasedRoutes = {
    profile: {
      student: '/student/profile',
      faculty: '/faculty/profile',
      'master-admin': '/admin/profile',
      'academic-admin': '/academic-admin/profile',
      'finance-admin': '/finance/profile',
    },
    settings: {
      student: '/student/settings',
      faculty: '/faculty/settings',
      'master-admin': '/admin/settings',
      'academic-admin': '/academic-admin/settings',
      'finance-admin': '/finance/settings',
    },
    notifications: {
      student: '/student/dashboard/notifications',
      faculty: '/faculty/notifications',
      'master-admin': '/admin/notifications',
      'academic-admin': '/academic-admin/notifications',
      'finance-admin': '/finance/notifications',
    }
  };

  // Updated handler functions to include role-based navigation
  const handleProfileClick = () => {
    const profileRoute = roleBasedRoutes.profile[navRole] || '/profile';
    navigate(profileRoute);
    setIsProfileDropdownOpen(false);
  };

  const handleSettingsClick = () => {
    const settingsRoute = roleBasedRoutes.settings[navRole] || '/settings';
    navigate(settingsRoute);
    setIsProfileDropdownOpen(false);
  };

  const handleNotificationsClick = () => {
    const notificationsRoute = roleBasedRoutes.notifications[navRole] || '/notifications';
    navigate(notificationsRoute);
  };

  return (
    <div className="flex h-screen bg-gray-50 ">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border border-m-2 `}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <span className="text-2xl font-semibold text-purple-600">StudySync</span>
          <button onClick={toggleSidebar} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-8">
          <ul>
            {navItems.map((item) => (
              <li key={item.id} className="mb-2">
                <div className="lg:hidden">
                  <button
                    onClick={() => item.children ? toggleDropdown(item.id) : handleNavigation(item.href)}
                    className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-purple-100 hover:text-purple-600"
                  >
                    <span className="flex items-center">
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.label}
                    </span>
                    {item.children && <ChevronDown className="h-4 w-4" />}
                  </button>
                  {item.children && dropdownOpen[item.id] && (
                    <ul className="ml-4 mt-2 space-y-2">
                      {item.children.map((child, index) => (
                        <li key={index}>
                          <button
                            onClick={() => handleNavigation(child.href)}
                            className={`block w-full text-left px-4 py-2 text-sm ${child.href === activeChildLink
                              ? 'bg-purple-100 text-purple-600'
                              : 'text-gray-500 hover:bg-purple-50'
                              }`}
                          >
                            <span className="flex items-center">
                              <child.icon className="mr-2 h-5 w-5" />
                              {child.label}
                            </span>

                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="hidden lg:block">
                  {item.id === activeMainLink && item.children && (
                    <ul className="mt-2 space-y-2">
                      {item.children.map((child, index) => (
                        <li key={index}>
                          <Link
                            to={child.href}
                            className={`block px-4 py-2 text-sm ${child.href === activeChildLink
                              ? 'bg-purple-100 text-purple-600'
                              : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                              }`}
                            onClick={() => setActiveChildLink(child.href)}
                          >
                            {/* {child.label} */}
                            <span className="flex items-center">
                              <child.icon className="mr-2 h-5 w-5" />
                              {child.label}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
          <button onClick={toggleSidebar} className="text-gray-500 lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <nav className="hidden lg:block">
            <ul className="flex space-x-8">
              {navItems.map((item) => (
                <li key={item.id} className="relative">
                  <button
                    onClick={() => handleMainLinkClick(item.id, item.href)}
                    className={`text-lg font-medium transition-all duration-300 ease-in-out ${activeMainLink === item.id
                      ? 'text-purple-600'
                      : 'text-gray-600 hover:text-purple-600 hover:scale-105'
                      }`}
                  >
                    {item.label}
                  </button>
                  {activeMainLink === item.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 transform origin-left transition-all duration-300 ease-in-out scale-x-100" />
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-purple-600 transition-colors duration-200" onClick={() => {
                      handleNotificationsClick()
                    }}>
              <Bell className="h-6 w-6" />
            </button>
            <div className="relative profile-dropdown">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-1 text-gray-700"
              >
                <span className='md:text-[22px] text-sm capitalize mr-3'>{firstName || "User"}</span>
                <img
                  src={imageUrl || avatar2}
                  alt="User avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <ChevronDown className="h-4 w-4" />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      // navigate('/profile')
                      handleProfileClick()
                      setIsProfileDropdownOpen(false)
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 w-full text-left"
                  >
                    <User className="inline-block w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      // navigate('/settings')
                      handleSettingsClick()
                      setIsProfileDropdownOpen(false)
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 w-full text-left"
                  >
                    <Settings className="inline-block w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 w-full text-left"
                  >
                    <LogOut className="inline-block w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Logout Confirmation Modal */}
        {showLogoutConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
              <p className="mb-6">Are you sure you want to log out?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleLogoutCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}