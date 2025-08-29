import { lazy, Suspense, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast';
import './App.css'
import Loader from './components/Loader';

import { Route, Routes } from 'react-router-dom';
const LoginPage = lazy(()=>import("./pages/Login"));
const SuperVisorDashboard = lazy(()=>import('./pages/supervisor/SupervisorDashboard'));
const MarkAttendancePage = lazy(()=>import("./pages/MarkAttendance"));
const InventoryPage = lazy(()=>import('./pages/supervisor/Inventory'));
const InvetoryProductDetailPage = lazy(()=>import('./pages/supervisor/ProductDetails'));
const ProductionPage = lazy(()=>import('./pages/supervisor/Production'));
const PrductionDetailPage = lazy(()=>import('./pages/supervisor/ProductionDetail'));
const EmployeesPage = lazy(()=>import('./pages/supervisor/Employees'));
const EmployeeDetailPage = lazy(()=>import('./pages/supervisor/EmployeeDetail'));
const RegisterEmployeePage = lazy(()=>import('./pages/supervisor/RegisterEmployee'));
const AssignTaskPage = lazy(()=>import('./components/AssignTask'))
const AdminDashboardPage = lazy(()=>import('./pages/admin/AdminDashboard'));
const EmployeeDashboardPage = lazy(()=>import('./pages/employee/EmployeeDashboard'));
const EmployeeTaskPage = lazy(()=>import('./pages/employee/EmployeeTask'));
const TasksPage = lazy(()=>import('./pages/supervisor/Tasks'))
import { useAuthStore } from './store/useAuthStore';

function App() {

  const fetchUser = useAuthStore((state) => state.fetchUser);
  const isUserLoading = useAuthStore((state) => state.isUserLoading);

  useEffect(() => {
    fetchUser(); // 👈 fetch once when app loads
  }, []);

    if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading user data...
      </div>
    );
  }

  return (
    <>
           <Toaster
  position="top-center"
  reverseOrder={false}
  gutter={8}
  containerClassName=""
  containerStyle={{}}
  toastOptions={{
    // Define default options
    className: '',
    duration: 5000,
    removeDelay: 1000,
    style: {
      background: '#363636',
      color: '#fff',
    },

    // Default options for specific types
    success: {
      duration: 3000,
      iconTheme: {
        primary: 'green',
        secondary: 'black',
      },
    },
  }}
/>

     <Suspense fallback={<Loader />}>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/supervisor/dashboard' element={<SuperVisorDashboard />} />
       

          {/*  EMPLOYEE ROUTES */}

          <Route path='employee/dashboard' element={<EmployeeDashboardPage />} />
           <Route path='/employee/attendance' element={<MarkAttendancePage />} />
       
          <Route path='/employee/task' element={<EmployeeTaskPage />} />
          <Route path='employee/dashboard' element={<MarkAttendancePage />} />


      {/* {  COMMON ROUTES FOR SUPERVISOR AND ADMIN} */}
        <Route path='/superVisor-admin/inventory' element={<InventoryPage />} />
          <Route path='/superVisor-admin/task' element={<TasksPage />} />
        <Route path='/superVisor-admin/inventory-Detail/:productId' element={<InvetoryProductDetailPage />} />
          <Route path='/superVisor-admin/production' element={<ProductionPage />} />
           <Route path='/superVisor-admin/production-detail/:prouductionId' element={<PrductionDetailPage />} />
          <Route path='/superVisor-admin/employees' element={<EmployeesPage />} />
            <Route path='/superVisor-admin/employee-detail/:workerId' element={<EmployeeDetailPage />} />
           <Route path='/superVisor-admin/register' element={<RegisterEmployeePage />} />
           <Route path="/superVisor-admin/assign-task/:workerId" element={<AssignTaskPage />} />

          {/* ADMIN RELATED ROUTES */}
<Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
      </Suspense>
    </>
  )
}

export default App
