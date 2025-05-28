import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import PreventiveMaintenance from './pages/PreventiveMaintenance';
import CapacityPlanner from './pages/CapacityPlanner';
import BudgetOptimisation from './pages/BudgetOptimisation';
import ProjectPlanning from './pages/ProjectPlanning';
import TechnicianBooking from './pages/TechnicianBooking'

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/maintenance" element={<PreventiveMaintenance />} />
            <Route path="/capacity-planner" element={<CapacityPlanner />} />
            <Route path="/budget-optimisation" element={<BudgetOptimisation />} />
             <Route path="/project-planning" element={<ProjectPlanning />} />
              <Route path="/technician-booking" element={<TechnicianBooking />} />
            {/* Add more routes here as needed */}
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
