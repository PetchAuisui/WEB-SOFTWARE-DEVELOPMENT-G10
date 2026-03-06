/* eslint-disable react/jsx-key */
import React, { lazy } from 'react'
import AuthorizedRoute from '../components/AuthorizedRoute'
import UnauthorizedRoute from '../components/UnauthorizedRoute'

// -------- Public Pages --------
const SignIn = lazy(() => import('../pages/SignIn/SignIn'))
const SignUp = lazy(() => import('../pages/SignUp/SignUp'))
const PasswordReset = lazy(() => import('../pages/PasswordReset/PasswordReset'))
const About = lazy(() => import('../pages/About'))

// -------- Protected Pages --------
const Home = lazy(() => import('../pages/Home/Home'))
const MyAccount = lazy(() => import('../pages/MyAccount/MyAccount'))
const Users = lazy(() => import('../pages/Users/Users'))
const AddUser = lazy(() => import('../pages/Users/AddUser'))
const EditUser = lazy(() => import('../pages/Users/EditUser'))
const UserChangePassword = lazy(() => import('../pages/Users/UserChangePassword'))

// 👇 Dashboard List Page (ต้องมี)
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'))

// 👇 Device Page ที่คุณแยกใหม่
const DevicePage = lazy(() => import('../pages/Device/DevicePage'))

const routes = [

  // ==========================
  // PUBLIC ROUTES
  // ==========================

  {
    path: '/signin',
    element: (
      <UnauthorizedRoute>
        <SignIn redirectTo="/home" />
      </UnauthorizedRoute>
    )
  },
  {
    path: '/signup',
    element: (
      <UnauthorizedRoute>
        <SignUp redirectTo="/home" />
      </UnauthorizedRoute>
    )
  },
  {
    path: '/password_reset',
    element: (
      <UnauthorizedRoute>
        <PasswordReset />
      </UnauthorizedRoute>
    )
  },
  {
    path: '/about',
    element: <About />
  },

  // ==========================
  // PROTECTED ROUTES
  // ==========================

  {
    path: '/home',
    element: (
      <AuthorizedRoute>
        <Home />
      </AuthorizedRoute>
    )
  },
  {
    path: '/my_account',
    element: (
      <AuthorizedRoute>
        <MyAccount />
      </AuthorizedRoute>
    )
  },
  {
    path: '/users',
    element: (
      <AuthorizedRoute>
        <Users />
      </AuthorizedRoute>
    )
  },
  {
    path: '/users/create',
    element: (
      <AuthorizedRoute>
        <AddUser />
      </AuthorizedRoute>
    )
  },
  {
    path: '/users/edit/:id',
    element: (
      <AuthorizedRoute>
        <EditUser />
      </AuthorizedRoute>
    )
  },
  {
    path: '/users/password/:id',
    element: (
      <AuthorizedRoute>
        <UserChangePassword />
      </AuthorizedRoute>
    )
  },

  // ==========================
  // DASHBOARD SECTION
  // ==========================

  // 🔹 Dashboard List
  {
    path: '/dashboard',
    element: (
      <AuthorizedRoute>
        <Dashboard />
      </AuthorizedRoute>
    )
  },

  // 🔹 Create Device
  {
    path: '/dashboard/create',
    element: (
      <AuthorizedRoute>
        <DevicePage />
      </AuthorizedRoute>
    )
  },

  // 🔹 Edit Device
  {
    path: '/dashboard/:id',
    element: (
      <AuthorizedRoute>
        <DevicePage />
      </AuthorizedRoute>
    )
  }

]

export default routes