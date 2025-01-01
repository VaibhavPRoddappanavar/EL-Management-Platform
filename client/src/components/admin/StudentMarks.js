import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      // Fetch marks for each phase
      const [phase1Res, phase2Res, phase3Res] = await Promise.all([
        axios.get('http://localhost:5000/api/marks/admin/phase/Phase1', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/marks/admin/phase/Phase2', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/marks/admin/phase/Phase3', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Process and combine the marks
      const processedMarks = [];
      const processedStudents = new Map(); // Use Map to track unique students

      // Helper function to process marks from a phase
      const processPhaseMarks = (phaseMarks, phase) => {
        phaseMarks.forEach(mark => {
          mark.studentMarks.forEach(student => {
            const key = student.studentEmail;
            if (!processedStudents.has(key)) {
              processedStudents.set(key, {
                name: student.studentName,
                usn: student.studentUSN,
                email: student.studentEmail,
                theme: mark.teamId?.Theme || 'Deleted', // Add null check and default value
                phaseWise: {
                  Phase1: 0,
                  Phase2: 0,
                  Phase3: 0
                }
              });
            }
            processedStudents.get(key).phaseWise[phase] = student.marks;
          });
        });
      };

      // Process marks from each phase
      processPhaseMarks(phase1Res.data, 'Phase1');
      processPhaseMarks(phase2Res.data, 'Phase2');
      processPhaseMarks(phase3Res.data, 'Phase3');

      // Convert Map to array and calculate totals
      const marksArray = Array.from(processedStudents.values());
      setMarks(marksArray);
    } catch (error) {
      console.error('Error fetching marks:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Student Marks Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // Prepare table data
    const tableData = marks.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.theme.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(student => {
      const phase1 = Math.max(0, student.phaseWise.Phase1 || 0);
      const phase2 = Math.max(0, student.phaseWise.Phase2 || 0);
      const phase3 = Math.max(0, student.phaseWise.Phase3 || 0);
      const total = phase1 + phase2 + phase3;
      
      return [
        student.name,
        student.usn,
        student.theme,
        phase1,
        phase2,
        phase3,
        total
      ];
    });

    // Add table
    doc.autoTable({
      startY: 30,
      head: [['Name', 'USN', 'Theme', 'Phase 1', 'Phase 2', 'Phase 3', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [71, 71, 71] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 20, halign: 'right' }
      }
    });

    // Save PDF
    doc.save('student-marks-report.pdf');
  };

  const filteredMarks = marks.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedMarks = filteredMarks
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          Student Marks Overview
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PrintIcon />}
          onClick={generatePDF}
        >
          Export PDF
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        margin="normal"
        placeholder="Search by name, USN, or theme..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>USN</TableCell>
              <TableCell>Theme</TableCell>
              <TableCell align="right">Phase 1</TableCell>
              <TableCell align="right">Phase 2</TableCell>
              <TableCell align="right">Phase 3</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedMarks.map((student, index) => {
              const phase1 = Math.max(0, student.phaseWise.Phase1 || 0);
              const phase2 = Math.max(0, student.phaseWise.Phase2 || 0);
              const phase3 = Math.max(0, student.phaseWise.Phase3 || 0);
              const total = phase1 + phase2 + phase3;

              return (
                <TableRow key={index}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.usn}</TableCell>
                  <TableCell>{student.theme}</TableCell>
                  <TableCell align="right">{phase1}</TableCell>
                  <TableCell align="right">{phase2}</TableCell>
                  <TableCell align="right">{phase3}</TableCell>
                  <TableCell align="right">{total}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredMarks.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

export default StudentMarks;
