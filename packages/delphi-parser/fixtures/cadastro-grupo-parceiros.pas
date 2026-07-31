unit CadastroGrupoParceiros;

interface

type
  TFrmCadastroGrupoParceiros = class
    procedure BtnSalvarClick(Sender: TObject);
  end;

implementation

procedure TFrmCadastroGrupoParceiros.BtnSalvarClick(Sender: TObject);
begin
  if QryGrupoParceiros.FieldByName('NOME').IsNull then
    raise Exception.Create('Nome do grupo e obrigatorio.');

  QryGrupoParceiros.SQL.Text := 'select ID, NOME, STATUS, CONTROLE from GRUPOPARCEIROS';
end;

end.
