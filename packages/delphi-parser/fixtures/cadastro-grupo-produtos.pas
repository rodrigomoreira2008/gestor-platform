unit CadastroGrupoProdutos;

interface

type
  TFrmCadastroGrupoProdutos = class
    procedure BtnGravarClick(Sender: TObject);
  end;

implementation

procedure TFrmCadastroGrupoProdutos.BtnGravarClick(Sender: TObject);
begin
  if QryGrupoProdutos.FieldByName('NOME').IsNull then
    raise Exception.Create('Nome do grupo e obrigatorio.');

  QryGrupoProdutos.SQL.Text := 'select ID, NOME, STATUS, CONTROLE from GRUPOPRODUTOS';
end;

end.
