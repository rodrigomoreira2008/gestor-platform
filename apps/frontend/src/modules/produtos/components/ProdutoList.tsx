import { Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Produto } from '../types/produto';

export interface ProdutoListProps {
  produtos: Produto[];
}

export function ProdutoList({ produtos }: ProdutoListProps) {
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
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>Nenhum produto cadastrado.</TableCell>
              </TableRow>
            )}

            {produtos.map((produto) => (
              <TableRow key={produto.id} hover>
                <TableCell>{produto.numero ?? produto.id}</TableCell>
                <TableCell>{produto.descricao}</TableCell>
                <TableCell>{produto.marca}</TableCell>
                <TableCell>{produto.grupo}</TableCell>
                <TableCell>{produto.unidade}</TableCell>
                <TableCell align="right">{formatMoney(produto.valorestimado)}</TableCell>
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
