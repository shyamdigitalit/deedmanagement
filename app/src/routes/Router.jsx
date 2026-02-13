import { Suspense, lazy } from 'react'
import '../styles/Main.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import ProtectedRoute from '../auth/AuthGuard'
import Loader from '../components/loader'
// import BilletChemistry from '../pages/Unit1/Billet Chemistry'
// import AddEditBilletChemistry from '../pages/Unit1/Billet Chemistry/form'


const Layout = lazy(() => import('../components/Layout'))

const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))

const Accounts = lazy(() => import('../pages/Masters/Accounts'));

const AccountType = lazy(() => import('../pages/Masters/AccountType'));
const AccountCategory = lazy(() => import('../pages/Masters/AccountCategory'));
// const Division = lazy(() => import('../pages/Masters/Division'));
const Department = lazy(() => import('../pages/Masters/Department'));
const Designation = lazy(() => import('../pages/Masters/Designation'));

const Function = lazy(() => import('../pages/Masters/Function'));
const State = lazy(() => import('../pages/Masters/State'));
const Company = lazy(() => import('../pages/Masters/Company'));
const Plant = lazy(() => import('../pages/Masters/Plant'));
const Material = lazy(() => import('../pages/Masters/Material'));
const Shift = lazy(() => import('../pages/Masters/Shift'));


const Deed = lazy(() => import('../pages/Deed'));
<<<<<<< Updated upstream
const Plot = lazy(() => import('../pages/Plot'));
=======
const AddEditDeed = lazy(() => import('../pages/Deed/form'));
const DeedBank = lazy(() => import('../pages/DeedBank'));
>>>>>>> Stashed changes



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
<<<<<<< Updated upstream
      { path: '/plot', element: <ProtectedRoute> <Plot /> </ProtectedRoute> },
      { path: '/bank', element: <ProtectedRoute> <Deed /> </ProtectedRoute> },
      // { path: '/deed/form', element: <ProtectedRoute><AddEditDeed /></ProtectedRoute> },
=======
      { path: '/plot', element: <ProtectedRoute> <Deed /> </ProtectedRoute> },
      { path: '/bank', element: <ProtectedRoute> <DeedBank /> </ProtectedRoute> },
      { path: '/deed/form', element: <ProtectedRoute><AddEditDeed /></ProtectedRoute> },
>>>>>>> Stashed changes
      // { path: '/hand-spectro-analysis-report', element: <ProtectedRoute><HandSpectroReport /></ProtectedRoute> },
      // { path: '/hand-spectro-analysis-report/form', element: <ProtectedRoute><AddEditHandSpectroReport /></ProtectedRoute> },
      // { path: '/melting-report-of-100-kg-fc', element: <ProtectedRoute><MeltingReport100KGFC /></ProtectedRoute> },
      // { path: '/melting-report-of-100-kg-fc/form', element: <ProtectedRoute><AddEditMeltingReport100KGFC /></ProtectedRoute> },
      // { path: '/melting-report-of-20-mt-fc', element: <ProtectedRoute><MeltingReport20MTFC /></ProtectedRoute> },
      // { path: '/melting-report-of-20-mt-fc/form', element: <ProtectedRoute><AddEditMeltingReport20MTFC /></ProtectedRoute> },
      // { path: '/billet-chemistry', element: <ProtectedRoute><BilletChemistry /></ProtectedRoute> },
      // { path: '/billet-chemistry/form', element: <ProtectedRoute><AddEditBilletChemistry /></ProtectedRoute> },
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
        { path: "function", element: <Function /> },
        { path: "state", element: <ProtectedRoute> <State /> </ProtectedRoute> },
        { path: "company", element: <ProtectedRoute> <Company /> </ProtectedRoute> },
        { path: "plant", element: <ProtectedRoute> <Plant /> </ProtectedRoute> },
        { path: "material", element: <ProtectedRoute> <Material /> </ProtectedRoute> },

      ]},
      { path: "/process", children: [
        { index: true, element: <Navigate to="shift" replace /> },
        { path: "shift", element: <ProtectedRoute> <Shift /> </ProtectedRoute> },

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
