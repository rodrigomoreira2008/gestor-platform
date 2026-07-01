import { Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Cliente } from '../types/cliente';

export interface ClienteListProps {
  clientes: Cliente[];
  selectedId?: number | null;
  onSelect?: (cliente: Cliente) => void;
  onDelete?: (cliente: Cliente) => void;
}

export function ClienteList({ clientes, selectedId, onSelect, onDelete }: ClienteListProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Clientes cadastrados
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CPF/CNPJ</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Cidade</TableCell>
              <TableCell>UF</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>Nenhum cliente cadastrado.</TableCell>
              </TableRow>
            )}

            {clientes.map((cliente) => (
              <TableRow key={cliente.id} hover selected={selectedId === cliente.id}>
                <TableCell>{cliente.nome}</TableCell>
                <TableCell>{cliente.documento}</TableCell>
                <TableCell>{cliente.telefone ?? cliente.celular}</TableCell>
                <TableCell>{cliente.cidade}</TableCell>
                <TableCell>{cliente.uf}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => onSelect?.(cliente)}>
                      Editar
                    </Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => onDelete?.(cliente)}>
                      Excluir
                    </Button>
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
