import React from 'react';
import { Box, Typography } from '@mui/material';

const CapacityPlanner: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>
      Capacity Planner
    </Typography>
    <Typography>
      Plan and optimize your resource and production capacity using AI-driven insights.
    </Typography>
  </Box>
);

export default CapacityPlanner;