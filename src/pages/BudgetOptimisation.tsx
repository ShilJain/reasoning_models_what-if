import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import Fade from '@mui/material/Fade';
import DownloadIcon from '@mui/icons-material/Download';
import { fetchOpenAICompletion } from '../services/openai.service';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const CHANNELS = [
  'Social Media',
  'Email',
  'SEO',
  'Paid Ads',
  'Content',
  'Influencer',
  'Events'
];

const TASK_OPTIONS = [
  'Number of days to run the campaign',
  'Channels to prioritize',
  'Allocate the budget to maximize reach and conversions',
  'Scenario simulation for aggressive early spend vs. sustained moderate spend'
];

/* Helper functions to parse and render the result */
type Block =
  | { type: 'text'; content: string }
  | { type: 'table'; header: string[]; rows: string[][] };

// Check if a line is a divider (e.g. -------- or _______)
const isDivider = (line: string) => /^(\s*[-_]{3,}\s*)$/.test(line);

// Parse the result into blocks of text and tables
function parseResult(result: string): Block[] {
  const blocks: Block[] = [];
  const lines = result.split('\n');
  let i = 0;

  while (i < lines.length) {
    // If this line has pipe characters, it might be a table
    if (lines[i].includes('|')) {
      const tableLines: string[] = [];
      
      // Collect consecutive lines that could be part of a table
      while (i < lines.length && (lines[i].includes('|') || isDivider(lines[i]))) {
        tableLines.push(lines[i]);
        i++;
      }
      
      // Filter out dividers and empty lines
      const cleanLines = tableLines.filter(line => line.trim() && !isDivider(line));
      
      // If we have at least a header and one row, it's a valid table
      if (cleanLines.length >= 2) {
        const header = cleanLines[0].split('|').map(cell => cell.trim()).filter(Boolean);
        const rows = cleanLines.slice(1).map(line => 
          line.split('|').map(cell => cell.trim()).filter(Boolean)
        );
        blocks.push({ type: 'table', header, rows });
      } else {
        // Not a valid table, treat as text
        blocks.push({ type: 'text', content: tableLines.join('\n') });
      }
    } else {
      // Collect text lines until we find a potential table
      const textLines: string[] = [];
      while (i < lines.length && !lines[i].includes('|')) {
        textLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'text', content: textLines.join('\n') });
    }
  }
  
  return blocks;
}

// Component to render the parsed result
const RenderResult: React.FC<{ content: string }> = ({ content }) => {
  const blocks = parseResult(content);
  
  return (
    <Box>
      {blocks.map((block, index) => 
        block.type === 'text' ? (
          // Render text blocks as preformatted text
          <Box 
            key={index}
            sx={{ 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'monospace', 
              fontSize: 16, 
              mb: 2,
              color: '#222' 
            }}
          >
            {block.content}
          </Box>
        ) : (
          // Render table blocks as MUI tables
          <TableContainer key={index} sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  {block.header.map((cell, i) => (
                    <TableCell key={i} sx={{ fontWeight: 'bold' }}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {block.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                    '&:last-child td': { borderBottom: 0 }
                  }}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
    </Box>
  );
};

const BudgetOptimisation: React.FC = () => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [totalBudget, setTotalBudget] = useState('');
  const [conversions, setConversions] = useState<{ [channel: string]: string }>({});
  const [minSpend, setMinSpend] = useState<{ [channel: string]: string }>({});
  const [maxSpend, setMaxSpend] = useState<{ [channel: string]: string }>({});
  const [additional, setAdditional] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [lastElapsed, setLastElapsed] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setElapsed(0);
      timer = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else if (!loading && elapsed > 0) {
      setLastElapsed(elapsed);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleChannelChange = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const handleConversionChange = (channel: string, value: string) => {
    setConversions((prev) => ({ ...prev, [channel]: value }));
  };

  const handleMinSpendChange = (channel: string, value: string) => {
    setMinSpend((prev) => ({ ...prev, [channel]: value }));
  };

  const handleMaxSpendChange = (channel: string, value: string) => {
    setMaxSpend((prev) => ({ ...prev, [channel]: value }));
  };

  const handleTaskChange = (task: string) => {
    setSelectedTasks((prev) =>
      prev.includes(task)
        ? prev.filter((t) => t !== task)
        : [...prev, task]
    );
  };

  // Combine prompt generation and optimisation into one button
  const handleOptimise = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const prompt = `
You are a marketing strategist at a consumer electronics company launching a new smart home device. You have a fixed budget and want to run a campaign across multiple channels.
Tasks: ${selectedTasks.join(', ') || 'Not specified'}
Channels selected: ${selectedChannels.join(', ') || 'None'}
Total budget: ${totalBudget}
${selectedChannels
  .map(
    (ch) =>
      `Conversion rate for ${ch}: ${conversions[ch] || 'Not specified'}
Minimum spend: ${minSpend[ch] || 'Not specified'}
Maximum spend: ${maxSpend[ch] || 'Not specified'}`
  )
  .join('\n')}
Additional constraints: ${additional || 'None'}
Suggest an optimal allocation of the total budget across the selected channels to maximize ROI, considering the provided conversion rates, min/max spends, and constraints. Return your answer in a clear format with sections and ASCII tables using pipe characters (|) for columns.
    `.trim();

    try {
      const response = await fetchOpenAICompletion({ input: prompt });
      setResult(response.choices[0].message.content);
    } catch (error) {
      setResult('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, pb: 6 }}>
      {/* Scenario Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}
        TransitionComponent={Fade}
        transitionDuration={600}>
        <DialogTitle>Scenario</DialogTitle>
        <DialogContent>
          <Typography>
            As the marketing director at Global Enterprises, you're tasked with optimizing the budget allocation for your upcoming marketing campaigns. With limited resources and multiple channels available (social media, email, influencer partnerships), you need to determine the most effective distribution of funds to maximize ROI. Using customer engagement metrics, and conversion rates across different channels, your goal is to create an optimized marketing budget that reaches your target audience effectively while staying within budget constraints.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: 400,
          mt: 2
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            bgcolor: '#f9f9fb',
            boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
            p: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: { xs: '100%', sm: 500 },
            maxWidth: { xs: '100%', sm: '60vw', md: '50vw' },
            width: '100%'
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
            <MonetizationOnIcon sx={{ fontSize: 40, color: '#107C10' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
            Budget Optimisation
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', fontSize: 17 }}>
            Get AI-powered recommendations for optimizing your marketing campaign budget allocation for maximizing ROI.
          </Typography>

          {/* Budget Optimisation Form */}
          <form onSubmit={handleOptimise} style={{ width: '100%' }}>
            {/* Task as checkbox group */}
            <FormGroup sx={{ mb: 2 }}>
              <Typography sx={{ mb: 1, fontWeight: 600 }}>Select Task(s):</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {TASK_OPTIONS.map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={selectedTasks.includes(option)}
                        onChange={() => handleTaskChange(option)}
                      />
                    }
                    label={option}
                  />
                ))}
              </Box>
            </FormGroup>

            {/* Channels as rows with all fields */}
            <FormGroup sx={{ mb: 2 }}>
              <Typography sx={{ mb: 1, fontWeight: 600 }}>Channels:</Typography>
              {CHANNELS.map((channel) => (
                <Box
                  key={channel}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    gap: 2,
                    bgcolor: selectedChannels.includes(channel) ? '#f4f6f8' : 'transparent',
                    borderRadius: 1,
                    px: 1
                  }}
                >
                  <Checkbox
                    checked={selectedChannels.includes(channel)}
                    onChange={() => handleChannelChange(channel)}
                  />
                  <Typography sx={{ width: 120 }}>{channel}</Typography>
                  <TextField
                    label="Conversion Rate (%)"
                    type="number"
                    value={conversions[channel] || ''}
                    onChange={(e) => handleConversionChange(channel, e.target.value)}
                    sx={{ width: 140 }}
                    inputProps={{ min: 0, max: 100 }}
                    disabled={!selectedChannels.includes(channel)}
                  />
                  <TextField
                    label="Min Spend"
                    type="number"
                    value={minSpend[channel] || ''}
                    onChange={(e) => handleMinSpendChange(channel, e.target.value)}
                    sx={{ width: 110 }}
                    inputProps={{ min: 0 }}
                    disabled={!selectedChannels.includes(channel)}
                  />
                  <TextField
                    label="Max Spend"
                    type="number"
                    value={maxSpend[channel] || ''}
                    onChange={(e) => handleMaxSpendChange(channel, e.target.value)}
                    sx={{ width: 110 }}
                    inputProps={{ min: 0 }}
                    disabled={!selectedChannels.includes(channel)}
                  />
                </Box>
              ))}
            </FormGroup>

            <TextField
              label="Total Budget"
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Additional Constraints or Information"
              multiline
              minRows={2}
              value={additional}
              onChange={(e) => setAdditional(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              placeholder="E.g. Minimum spend per channel, target audience, etc."
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                loading ||
                selectedTasks.length === 0 ||
                !totalBudget ||
                selectedChannels.length === 0
              }
              sx={{
                borderRadius: 99,
                px: 4,
                py: 1.2,
                fontWeight: 600,
                fontSize: 16,
                textTransform: 'none'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Optimise Budget'}
            </Button>
            {loading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  In progress... {elapsed}s elapsed
                </Typography>
              </Box>
            )}
          </form>
          {!loading && lastElapsed !== null && result && (
            <Typography
              variant="caption"
              sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}
            >
              Time elapsed: {lastElapsed}s
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Results Section */}
      {result && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Paper elevation={0} sx={{
            borderRadius: 4,
            bgcolor: '#f9f9fb',
            boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
            p: { xs: 3, sm: 4 },
            maxWidth: { xs: '100%', sm: '60vw', md: '50vw' },
            width: '100%'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Budget Allocation Results
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  const blob = new Blob([result], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'budget-allocation-report.txt';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                sx={{
                  borderRadius: 20,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Download Report
              </Button>
            </Box>
            
            {/* Use the new table renderer */}
            <RenderResult content={result} />
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default BudgetOptimisation;
