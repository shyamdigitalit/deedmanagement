import { Suspense, lazy } from 'react'
import '../styles/Main.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import ProtectedRoute from '../auth/AuthGuard'
import Loader from '../components/loader'


const Layout = lazy(() => import('../components/Layout'))

const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))

const Accounts = lazy(() => import('../pages/Masters/Accounts'));

const AccountType = lazy(() => import('../pages/Masters/AccountType'));
const AccountCategory = lazy(() => import('../pages/Masters/AccountCategory'));
// const Division = lazy(() => import('../pages/Masters/Division'));
const Department = lazy(() => import('../pages/Masters/Department'));
const Designation = lazy(() => import('../pages/Masters/Designation'));

// const Function = lazy(() => import('../pages/Masters/Function'));
const State = lazy(() => import('../pages/Masters/State'));
const Company = lazy(() => import('../pages/Masters/Company'));
const Plant = lazy(() => import('../pages/Masters/Plant'));
const Location = lazy(() => import('../pages/Masters/Location'));
const Material = lazy(() => import('../pages/Masters/Material'));
const Shift = lazy(() => import('../pages/Masters/Shift'));
const Plot = lazy(() => import('../pages/Masters/Plot'));


const Deed = lazy(() => import('../pages/Deed'));
const DeedBank = lazy(() => import('../pages/DeedBank'));
const DeedSummary = lazy(() => import('../pages/Summary'));



const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // ⬅️ Common layout with Navbar/Header
    errorElement: <div>404! Page not found</div>,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: '/login', element: <Login /> },
      { path: '/home', element: <ProtectedRoute> <Home /> </ProtectedRoute>  },
      { path: '/deed', element: <ProtectedRoute> <Deed /> </ProtectedRoute> },
      { path: '/plot', element: <ProtectedRoute> <Plot /> </ProtectedRoute> },
      { path: '/bank', element: <ProtectedRoute> <DeedBank /> </ProtectedRoute> },
      { path: '/summary', element: <ProtectedRoute> <DeedSummary /> </ProtectedRoute> },
      { path: '/accounts', element: <ProtectedRoute> <Accounts /> </ProtectedRoute> },
      // { path: '/approval-management', element: <ProtectedRoute> <ApprovalManagement /> </ProtectedRoute> },
      // { path: '/form-approval', element: <ProtectedRoute> <FormApproval /> </ProtectedRoute> },
      { path: '/account', children: [
        { index: true, element: <Navigate to="type" replace /> },
        { path: 'type', element: <ProtectedRoute><AccountType /></ProtectedRoute> },
        { path: 'category', element: <ProtectedRoute><AccountCategory /></ProtectedRoute> },
        // { path: 'division', element: <ProtectedRoute><Division /></ProtectedRoute> },
        { path: 'department', element: <ProtectedRoute><Department /></ProtectedRoute> },
        { path: 'designation', element: <ProtectedRoute><Designation /></ProtectedRoute> },
      ]},
      { path: "/admin", children: [
        { index: true, element: <Navigate to="state" replace /> },
        // { path: "function", element: <Function /> },
        { path: "state", element: <ProtectedRoute> <State /> </ProtectedRoute> },
        { path: "company", element: <ProtectedRoute> <Company /> </ProtectedRoute> },
        { path: "plant", element: <ProtectedRoute> <Plant /> </ProtectedRoute> },
        { path: "location", element: <ProtectedRoute> <Location /> </ProtectedRoute> },
        { path: "material", element: <ProtectedRoute> <Material /> </ProtectedRoute> },

      ]},
      { path: "/setup", children: [
        { index: true, element: <Navigate to="plot" replace /> },
        { path: "plot", element: <ProtectedRoute> <Plot /> </ProtectedRoute> },
        // { path: "shift", element: <ProtectedRoute> <Shift /> </ProtectedRoute> },

      ]}
    ]
  },
]);

const protectedRoutes = [""];
router.routes.forEach(route => {
  if (protectedRoutes.includes(route.path)) {
    route.element = <ProtectedRoute element={route.element} />;
  }
});

const Router = () => {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}


export default Router
