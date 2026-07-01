import { Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Fornecedor } from '../../fornecedores/types/fornecedor';

export function List({ items, selectedId, onSelect, onDelete }: { items: Fornecedor[]; selectedId?: number | null; onSelect?: (item: Fornecedor) => void; onDelete?: (item: Fornecedor) => void }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Suppliers</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Document</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>City</TableCell>
              <TableCell>State</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} hover selected={selectedId === item.id}>
                <TableCell>{item.razaoSocial}</TableCell>
                <TableCell>{item.documento}</TableCell>
                <TableCell>{item.telefone ?? item.celular}</TableCell>
                <TableCell>{item.cidade}</TableCell>
                <TableCell>{item.uf}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => onSelect?.(item)}>Edit</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => onDelete?.(item)}>Delete</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
