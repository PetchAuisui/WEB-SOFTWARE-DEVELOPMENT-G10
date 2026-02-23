/* eslint-disable react/jsx-key */
import React, { lazy } from 'react'
import AuthorizedRoute from '../components/AuthorizedRoute'
import UnauthorizedRoute from '../components/UnauthorizedRoute'

const SignIn = lazy(() => import('../pages/SignIn/SignIn'))
const SignUp = lazy(() => import('../pages/SignUp/SignUp'))
const PasswordReset = lazy(() => import('../pages/PasswordReset/PasswordReset'))
const About = lazy(() => import('../pages/About'))
const Home = lazy(() => import('../pages/Home/Home'))
const MyAccount = lazy(() => import('../pages/MyAccount/MyAccount'))
const Users = lazy(() => import('../pages/Users/Users'))
const AddUser = lazy(() => import('../pages/Users/AddUser'))
const EditUser = lazy(() => import('../pages/Users/EditUser'))
const UserChangePassword = lazy(() => import('../pages/Users/UserChangePassword'))
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'))
const Device = lazy(() => import('../pages/Dashboard/Device'))

const routes = [
  {
    path: '/signin',
    exact: true,
    element: (
      <UnauthorizedRoute>
        <SignIn redirectTo="/home" />
      </UnauthorizedRoute>
    ),
  },
  {
    path: '/signup',
    exact: true,
    element: (
      <UnauthorizedRoute>
        <SignUp redirectTo="/home" />
      </UnauthorizedRoute>
    ),
  },
  {
    path: '/password_reset',
    exact: true,
    element: (
      <UnauthorizedRoute>
        <PasswordReset />
      </UnauthorizedRoute>
    ),
  },
  {
    path: '/about',
    exact: true,
    element: <About />,
  },
  {
    path: '/my_account',
    exact: true,
    element: (
      <AuthorizedRoute>
        <MyAccount />
      </AuthorizedRoute>
    ),
  },
  {
    path: '/home',
    exact: true,
    element: (
      <AuthorizedRoute>
        <Home />
      </AuthorizedRoute>
    ),
  },
  {
    path: '/users',
    exact: true,
    element: (
      <AuthorizedRoute>
        <Users />
      </AuthorizedRoute>
    ),
  },
  {
    path: '/users/create',
    exact: true,
    element: (
      <AuthorizedRoute>
        <AddUser />
      </AuthorizedRoute>
    ),
  },
  {
    path: 'users/edit/:id',
    exact: true,
    element: (
      <AuthorizedRoute>
        <EditUser />
      </AuthorizedRoute>
    ),
  },
  {
    path: '/users/password/:id',
    exact: true,
    element: (
      <AuthorizedRoute>
        <UserChangePassword />
      </AuthorizedRoute>
    ),
  },
    {
    path: '/dashboard',
    exact: true,
    element: (
      <AuthorizedRoute>
        <Dashboard />
      </AuthorizedRoute>
    ),
  },
    {
    path: '/dashboard/:id', // รองรับทั้ง /dashboard/create และ /dashboard/123
    exact: true,
    element: (
      <AuthorizedRoute>
        <Device />
      </AuthorizedRoute>
    )
  }
]

export default routes
