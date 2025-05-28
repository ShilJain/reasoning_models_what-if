import React from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  Container, 
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  Paper
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

interface NavigationTabProps {
  label: string;
  path: string;
}

const navigationTabs: NavigationTabProps[] = [
  { label: 'Home', path: '/' },
  { label: 'Preventive Maintenance', path: '/maintenance' },
  { label: 'Capacity Planner', path: '/capacity-planner' },
  { label: 'Budget Optimisation', path: '/budget-optimisation' },
  { label: 'Rostering', path: '/technician-booking' }
];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const currentTabIndex = navigationTabs.findIndex(tab => 
    tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path)
  );

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      {/* Modern white header bar with logo and tabs */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: { xs: 0, sm: 4 },
          boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
          mx: { xs: 0, sm: 3 },
          mt: { xs: 0, sm: 3 },
          mb: 2,
          px: { xs: 2, sm: 4 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {/* Microsoft Logo SVG */}
          <Box sx={{ width: 32, height: 32, mr: 1 }}>
            <svg viewBox="0 0 32 32">
              <rect x="0" y="0" width="14" height="14" fill="#F25022"/>
              <rect x="18" y="0" width="14" height="14" fill="#7FBA00"/>
              <rect x="0" y="18" width="14" height="14" fill="#00A4EF"/>
              <rect x="18" y="18" width="14" height="14" fill="#FFB900"/>
            </svg>
          </Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Microsoft
          </Typography>
        </Box>
        <Tabs 
          value={currentTabIndex !== -1 ? currentTabIndex : 0}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : undefined}
          sx={{ 
            minHeight: 0,
            '& .MuiTab-root': {
              minWidth: isMobile ? 'auto' : 120,
              px: { xs: 1, sm: 3 },
              py: 1.2,
              color: '#222',
              fontWeight: 500,
              borderRadius: 2,
              transition: 'background 0.2s',
              '&:hover': {
                background: '#f4f6f8',
              },
              '&.Mui-selected': {
                color: '#0078D4',
                background: '#f0f6fc',
              }
            }
          }}
          TabIndicatorProps={{
            style: {
              backgroundColor: '#0078D4',
              height: 3,
              borderRadius: 2
            }
          }}
        >
          {navigationTabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label} 
              component={Link} 
              to={tab.path}
            />
          ))}
        </Tabs>
      </Box>
      
      {/* Modern, bold heading and subheading */}
      <Box sx={{ bgcolor: '#f4f6f8', py: { xs: 4, sm: 6 }, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1px' }}>
          AI powered What-if Analysis
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400 }}>
          Meet your AI-powered, human-led solutions – Intelligence on tap to optimize your operations.
        </Typography>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f4f6f8', py: { xs: 2, sm: 1} }}>
        <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
          {children}
        </Container>
      </Box>
      
      <Box component="footer" sx={{ py: 2, px: 2, mt: 'auto', backgroundColor: '#f3f2f1', borderTop: '1px solid #e1dfdd' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Powered by Azure OpenAI
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;