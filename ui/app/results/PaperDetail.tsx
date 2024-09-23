import React, { useState } from 'react';
import { Link } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Table, TableContainer, TableBody, TableRow, TableCell } from '@mui/material';

interface PaperDetailProps {
  open: boolean;
  onClick: () => void;
  row: any;
}

export default function PaperDetail({ open, onClick, row }: PaperDetailProps) {
  return (
    <>
      <Dialog
        open={open}
        maxWidth={"md"}
        scroll={"paper"}
        onBackdropClick={onClick}
        fullWidth>
        <DialogTitle>
          <Link href={row.url} target="_blank" rel="noreferrer">
            {row.title}
          </Link>
        </DialogTitle>
        <DialogContent dividers={true}>
          <TableContainer>
            <Table>
              <TableBody>
                {Object.keys(row).filter((key) => key !== 'mutation').map((key) => (
                  <TableRow key={key}>
                    <TableCell component="th" scope="row" sx={{ textAlign: 'center' }}>
                      {key}
                    </TableCell>
                    <TableCell sx={{
                      whiteSpace: 'pre-wrap',
                      textAlign: 'justify',
                    }}>
                      {row[key]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClick}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}