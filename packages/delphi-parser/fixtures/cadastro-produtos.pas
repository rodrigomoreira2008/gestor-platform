unit CadastroProdutos;

interface

type
  TFrmCadastroProdutos = class
    procedure BtnGravarClick(Sender: TObject);
  end;

implementation

procedure TFrmCadastroProdutos.BtnGravarClick(Sender: TObject);
begin
  if QryProdutos.FieldByName('DESCRICAO').IsNull then
    raise Exception.Create('Descricao e obrigatoria.');

  QryProdutos.SQL.Text := 'select p.ID, p.DESCRICAO, p.GRUPO_ID, g.NOME from PRODUTOS p inner join GRUPOPRODUTOS g on g.ID = p.GRUPO_ID';
  QryMovimentos.SQL.Text := 'select m.ID, m.PRODUTO_ID, m.QUANTIDADE from MOVIMENTOSPRODUTO m where m.PRODUTO_ID = :ID';
end;

end.
