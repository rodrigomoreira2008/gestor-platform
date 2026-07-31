unit CadastroPedidos;

interface

implementation

procedure TFrmPedidos.ValidarCadastro;
begin
  if Trim(EdtNumero.Text) = '' then
    raise Exception.Create('Número do pedido é obrigatório.');
  if CboCliente.KeyValue = Null then
    raise Exception.Create('Cliente é obrigatório.');
  if EdtTotal.Value <= 0 then
    raise Exception.Create('Valor total deve ser maior que zero.');
end;

procedure TFrmPedidos.CarregarItens;
begin
  QryItensPedido.SQL.Text :=
    'select I.ID, I.PEDIDO_ID, I.PRODUTO_ID, I.QUANTIDADE, I.VALOR_UNITARIO ' +
    'from ITENSPEDIDO I inner join PEDIDOS P on P.ID = I.PEDIDO_ID ' +
    'where I.PEDIDO_ID = :PEDIDO_ID';
end;

end.
