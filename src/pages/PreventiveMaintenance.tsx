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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import Fade from '@mui/material/Fade';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { fetchOpenAICompletion } from '../services/openai.service';
// Add this import at the top of the file with your other imports
import DownloadIcon from '@mui/icons-material/Download';

// Helper: Parse ASCII table block into headers and rows, using header between dotted lines if present
function parseAsciiTableBlock(tableBlock: string) {
  const lines = tableBlock
    .split('\n')
    .map(line => line.trim())
    .filter(line => line); // keep all lines

  // Find the header: first line with '|' after a separator line
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const isSeparator = /^[-_ ]+$/.test(lines[i]);
    const isTableLine = lines[i].includes('|');
    if (isTableLine && i > 0 && /^[-_ ]+$/.test(lines[i - 1])) {
      headerIdx = i;
      break;
    }
    // Also handle if the block starts with a header (no separator at top)
    if (isTableLine && i === 0) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return null;

  // Only use lines with '|' after the header as rows
  const rows: string[][] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    if (lines[i].includes('|')) {
      rows.push(lines[i].split('|').map(cell => cell.trim()));
    }
  }

  const headers = lines[headerIdx].split('|').map(h => h.trim());
  return { headers, rows };
}

// Improved: Split result into text and table blocks (any consecutive lines with | are a table, but header is the first such line after dashed lines)
function splitTextAndTables(result: string) {
  const lines = result.split('\n');
  const blocks: { type: 'text' | 'table', content: string }[] = [];
  let buffer: string[] = [];
  let inTable = false;

  const flush = (type: 'text' | 'table') => {
    if (buffer.length) {
      blocks.push({ type, content: buffer.join('\n') });
      buffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isSeparator = /^[-_ ]+$/.test(line);
    const isTableLine = line.includes('|');
    if (isTableLine) {
      if (!inTable) flush('text');
      inTable = true;
      buffer.push(line);
    } else if (isSeparator) {
      if (inTable) flush('table');
      inTable = false;
      buffer.push(line);
    } else {
      if (inTable) flush('table');
      inTable = false;
      buffer.push(line);
    }
  }
  flush(inTable ? 'table' : 'text');
  return blocks;
}

// Main render function for results
const renderFormattedResult = (result: string) => {
  const blocks = splitTextAndTables(result);

  return (
    <Box>
      {blocks.map((block, idx) => {
        if (block.type === 'table') {
          const table = parseAsciiTableBlock(block.content);
          if (table) {
            return (
              <Table
                key={idx}
                size="small"
                sx={{
                  my: 3,
                  background: '#fff',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  '& th, & td': { fontSize: 15, px: 2, py: 1 }
                }}
              >
                <TableHead>
                  <TableRow>
                    {table.headers.map((header, hidx) => (
                      <TableCell key={hidx} sx={{ fontWeight: 700, background: '#f4f6f8' }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {table.rows.map((row, ridx) => (
                    <TableRow key={ridx}>
                      {row.map((cell, cidx) => (
                        <TableCell key={cidx}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            );
          }
        }
        // Render text block, preserving line breaks and spacing
        return (
          <Typography
            key={idx}
            variant="body1"
            component="div"
            sx={{ whiteSpace: 'pre-line', my: 2, fontSize: 16 }}
          >
            {block.content.trim()}
          </Typography>
        );
      })}
    </Box>
  );
};

const PreventiveMaintenance: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [engineersFile, setEngineersFile] = useState<File | null>(null);
  const [equipmentFile, setEquipmentFile] = useState<File | null>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [openDialog, setOpenDialog] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [lastElapsed, setLastElapsed] = useState<number | null>(null);

  // Timer for elapsed seconds during loading
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetchOpenAICompletion({ input });
      setResult(response.choices[0].message.content);
      console.log(response.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      setResult('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'engineers' | 'equipment' | 'input'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'engineers') {
        setEngineersFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setInput(prev =>
            prev +
            `\n<dataset>\n  <engineer_list>\n${text}\n  </engineer_list>\n</dataset>\n`
          );
        };
        reader.readAsText(file);
      } else if (type === 'equipment') {
        setEquipmentFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setInput(prev =>
            prev +
            `\n<dataset>\n  <task_list>\n${text}\n  </task_list>\n</dataset>\n`
          );
        };
        reader.readAsText(file);
      } else if (type === 'input') {
        setInputFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setInput(text);
        };
        reader.readAsText(file);
      }
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
            Imagine you're the resource manager at Contoso Mining Company on February 25, 2025. You have a list of maintenance tasks for various mechanical parts—each with a potential downtime risk, cost implications, and required engineering expertise—and every part must be serviced every three months. With a roster of specialized engineers who have limited availability over the next two weeks, your challenge is to prioritize tasks based on risk and cost, assign the right engineers to minimize downtime, and plan risk mitigation strategies for any tasks you can't assign immediately due to resource constraints.
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
            minWidth: { xs: '100%', sm: 1000 },
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
            <SettingsSuggestIcon sx={{ fontSize: 40, color: '#F25022' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
            Resource optimisation for Preventive Maintenance
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', fontSize: 17 }}>
            Get AI-powered recommendations for resource optimisation for preventive maintenance. Our system analyzes your inputs to provide tailored maintenance schedules and resource allocation suggestions.
          </Typography>

          {/* File Upload Section */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', width: '100%', justifyContent: 'center' }}>
            {/* Input Data FIRST */}
            <Box>
              <input
                type="file"
                accept=".txt,.csv"
                style={{ display: 'none' }}
                id="input-upload"
                onChange={(e) => handleFileUpload(e, 'input')}
              />
              <label htmlFor="input-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  sx={{
                    borderRadius: 99,
                    px: 2.5,
                    py: 1,
                    fontWeight: 600,
                    bgcolor: '#fff',
                    borderColor: '#e0e0e0',
                    color: '#222',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#f4f6f8',
                      borderColor: '#bdbdbd'
                    }
                  }}
                >
                  Upload Instructions
                </Button>
              </label>
              {inputFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {inputFile.name}
                </Typography>
              )}
            </Box>

            {/* Engineers SECOND */}
            <Box>
              <input
                type="file"
                accept=".csv,.xlsx"
                style={{ display: 'none' }}
                id="engineers-upload"
                onChange={(e) => handleFileUpload(e, 'engineers')}
              />
              <label htmlFor="engineers-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  sx={{
                    borderRadius: 99,
                    px: 2.5,
                    py: 1,
                    fontWeight: 600,
                    bgcolor: '#fff',
                    borderColor: '#e0e0e0',
                    color: '#222',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#f4f6f8',
                      borderColor: '#bdbdbd'
                    }
                  }}
                >
                  Upload Engineers Data
                </Button>
              </label>
              {engineersFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {engineersFile.name}
                </Typography>
              )}
            </Box>

            {/* Equipment THIRD */}
            <Box>
              <input
                type="file"
                accept=".csv,.xlsx"
                style={{ display: 'none' }}
                id="equipment-upload"
                onChange={(e) => handleFileUpload(e, 'equipment')}
              />
              <label htmlFor="equipment-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  sx={{
                    borderRadius: 99,
                    px: 2.5,
                    py: 1,
                    fontWeight: 600,
                    bgcolor: '#fff',
                    borderColor: '#e0e0e0',
                    color: '#222',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#f4f6f8',
                      borderColor: '#bdbdbd'
                    }
                  }}
                >
                  Upload Equipment Data
                </Button>
              </label>
              {equipmentFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {equipmentFile.name}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Progress bar and elapsed time */}
          {loading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress />
              <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                In progress... {elapsed}s elapsed
              </Typography>
            </Box>
          )}

          {/* Analysis Input Section */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Enter your maintenance analysis query..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !input.trim()}
              sx={{
                borderRadius: 99,
                px: 4,
                py: 1.2,
                fontWeight: 600,
                fontSize: 16,
                textTransform: 'none'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Plan'}
            </Button>
          </form>

          {/* Show time elapsed after run is complete */}
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
          Resource Allocation Results
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={() => {
            // Create a blob from the result
            const blob = new Blob([result], { type: 'text/plain' });
            // Create a URL for the blob
            const url = URL.createObjectURL(blob);
            // Create a temporary anchor element
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resource-allocation-report.txt';
            // Trigger the download
            document.body.appendChild(a);
            a.click();
            // Clean up
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
      {renderFormattedResult(result)}
    </Paper>
  </Box>
)}
    </Box>
  );
};

export default PreventiveMaintenance;