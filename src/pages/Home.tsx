import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { Link as RouterLink } from 'react-router-dom';

const cardData = [
  {
    icon: <SettingsSuggestIcon sx={{ fontSize: 40, color: '#F25022' }} />,
    title: 'Preventive Maintenance',
    desc: 'Get AI-powered recommendations for resource optimisation for preventive maintenance.Our system analyzes your inputs to provide tailored maintenance schedules and resource allocation suggestions',
    to: '/maintenance',
    button: 'View Outcomes'
  },
  {
    icon: <AssessmentIcon sx={{ fontSize: 40, color: '#7FBA00' }} />,
    title: 'Capacity Planner',
    desc: 'Plan and optimize your resource and production capacity',
    to: '/capacity-planner',
    button: 'View Outcomes'
  },
  {
    icon: <MonetizationOnIcon sx={{ fontSize: 40, color: '#00A4EF' }} />,
    title: 'Budget Optimisation',
    desc: 'Use reasoning models to optimise cost when the project plan changes for maximum efficiency and savings',
    to: '/budget-optimisation',
    button: 'View Outcomes'
  },
  {
    icon: <EngineeringIcon sx={{ fontSize: 40, color: '#F25022' }} />,
    title: 'Rostering',
    desc: 'Book and manage technician schedules efficiently with AI-driven recommendations and availability tracking',
    to: '/technician-booking',
    button: 'View Outcomes'
  }
];

const Home: React.FC = () => {
  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, pb: 6 }}>
      <Box
        sx={{
          display: 'grid',
          // Changed to 2x2 grid layout
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 4,
          justifyContent: 'center',
          alignItems: 'stretch',
          maxWidth: 1000, // Made narrower to fit 2 cards per row better
          mx: 'auto',
          mt: 2
        }}
      >
        {cardData.map((card, idx) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              borderRadius: 4,
              bgcolor: '#f9f9fb',
              boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
              p: { xs: 3, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 320,
              position: 'relative',
              transition: 'box-shadow 0.2s, transform 0.2s',
              '&:hover': {
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                transform: 'translateY(-2px) scale(1.02)'
              }
            }}
          >
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: '50%',
                width: 72,
                height: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                mb: 2
              }}
            >
              {card.icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
              {card.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', fontSize: 17 }}>
              {card.desc}
            </Typography>
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Button
                component={RouterLink}
                to={card.to}
                variant="outlined"
                sx={{
                  borderRadius: 99,
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  fontSize: 16,
                  bgcolor: '#fff',
                  borderColor: '#e0e0e0',
                  color: '#222',
                  boxShadow: 'none',
                  textTransform: 'none',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: '#f4f6f8',
                    borderColor: '#bdbdbd'
                  }
                }}
              >
                {card.button}
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* "How it works" section at the bottom */}
      <Box sx={{ mt: 6, maxWidth: 1200, mx: 'auto' }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            bgcolor: '#f9f9fb',
            boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
            p: { xs: 3, sm: 4 },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            How It Works
          </Typography>
          <Typography paragraph>
            Our application leverages Azure OpenAI's powerful reasoning models to
            analyze your input data and provide insights.
          </Typography>
          <Typography paragraph>
            Simply navigate to the desired tool, input your requirements or problem
            description, and let our AI generate recommendations tailored to your
            specific needs.
          </Typography>
          <Typography>
            All processing is done securely through Azure's enterprise-grade
            infrastructure, ensuring data privacy and reliable performance.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Home;