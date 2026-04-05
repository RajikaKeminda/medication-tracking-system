import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { CreateOrderPage } from './pages/CreateOrderPage'
import { MedicationRequestsPage } from './pages/MedicationRequestsPage'
import { CreateMedicationRequestPage } from './pages/CreateMedicationRequestPage'
import { MedicationRequestDetailPage } from './pages/MedicationRequestDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <MedicationRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/new"
          element={
            <ProtectedRoute>
              <CreateMedicationRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute>
              <MedicationRequestDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/new"
          element={
            <ProtectedRoute>
              <CreateOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
