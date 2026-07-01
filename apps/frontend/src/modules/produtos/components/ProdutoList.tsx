import { Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Produto } from '../types/produto';

export interface ProdutoListProps {
  produtos: Produto[];
  selectedId?: number | null;
  onSelect?: (produto: Produto) => void;
  onDelete?: (produto: Produto) => void;
}

export function ProdutoList({ produtos, selectedId, onSelect, onDelete }: ProdutoListProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Produtos cadastrados
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Grupo</TableCell>
              <TableCell>Unidade</TableCell>
              <TableCell align="right">Valor estimado</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>Nenhum produto cadastrado.</TableCell>
              </TableRow>
            )}

            {produtos.map((produto) => (
              <TableRow key={produto.id} hover selected={selectedId === produto.id}>
                <TableCell>{produto.numero ?? produto.id}</TableCell>
                <TableCell>{produto.descricao}</TableCell>
                <TableCell>{produto.marca}</TableCell>
                <TableCell>{produto.grupo}</TableCell>
                <TableCell>{produto.unidade}</TableCell>
                <TableCell align="right">{formatMoney(produto.valorestimado)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => onSelect?.(produto)}>
                      Editar
                    </Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => onDelete?.(produto)}>
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

function formatMoney(value?: number | null): string {
  if (value === undefined || value === null) return '-';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
