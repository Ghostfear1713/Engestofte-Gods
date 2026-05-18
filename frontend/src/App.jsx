import { Routes, Route, Navigate } from 'react-router-dom'
import WizardPage from './components/WizardPage'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import InquiryList from './admin/InquiryList'
import InquiryDetail from './admin/InquiryDetail'
import { useAdminAuth } from './admin/useAdminAuth'

function ProtectedRoute({ children }) {
  const { token } = useAdminAuth()
  return token ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Customer wizard */}
      <Route path="/" element={<WizardPage />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<InquiryList />} />
        <Route path="inquiries/:id" element={<InquiryDetail />} />
      </Route>
    </Routes>
  )
}
