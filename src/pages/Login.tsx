import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, ThemeProvider, createTheme } from '@mui/material';

// Main app theme (Segoe UI, light gray bg, blue primary)
const msTheme = createTheme({
  palette: {
    primary: { main: '#0078D4' },
    background: { default: '#f3f4f6' }
  },
  typography: {
    fontFamily: '"Segoe UI", Arial, sans-serif',
    h5: { fontWeight: 700 }
  }
});

// Microsoft logo + text
const MicrosoftHeader = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
    <svg width="32" height="32" viewBox="0 0 48 48" style={{ marginRight: 8 }}>
      <rect x="2" y="2" width="20" height="20" fill="#F25022"/>
      <rect x="26" y="2" width="20" height="20" fill="#7FBA00"/>
      <rect x="2" y="26" width="20" height="20" fill="#00A4EF"/>
      <rect x="26" y="26" width="20" height="20" fill="#FFB900"/>
    </svg>
    <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>
      Microsoft
    </Typography>
  </Box>
);

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === '' || password === '') {
      setError('Please enter both username and password.');
    } else if (username === 'aseanai' && password === 'aseanai') {
      setError('');
      onLogin();
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <ThemeProvider theme={msTheme}>
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Paper elevation={3} sx={{
          p: { xs: 3, sm: 5 },
          width: 370,
          borderRadius: 3,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)'
        }}>
          <MicrosoftHeader />
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 1, color: '#222' }}>
            Sign in
          </Typography>
          <Typography sx={{ mb: 3, textAlign: 'center', color: 'text.secondary', fontWeight: 500, fontSize: 18 }}>
            AI powered What-If Analysis
          </Typography>
          {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, fontWeight: 600, fontSize: 16, py: 1.2, borderRadius: 2 }}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Login;