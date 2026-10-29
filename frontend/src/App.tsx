import { AppBar, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import EmployeesPage from './pages/EmployeesPage'
import InsightsPage from './pages/InsightsPage'

export default function App() {
  const { pathname } = useLocation()
  const tab = pathname.startsWith('/insights') ? '/insights' : '/employees'
  return (
    <>
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary">ACME Salaries</Typography>
          <Tabs value={tab}>
            <Tab label="Employees" value="/employees" component={Link} to="/employees" />
            <Tab label="Insights" value="/insights" component={Link} to="/insights" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Routes>
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Routes>
      </Container>
    </>
  )
}
