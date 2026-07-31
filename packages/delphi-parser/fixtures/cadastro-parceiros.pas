unit CadastroParceiros;

interface

type
  TFrmCadastroParceiros = class
    procedure BtnSalvarClick(Sender: TObject);
  end;

implementation

procedure TFrmCadastroParceiros.BtnSalvarClick(Sender: TObject);
begin
  if QryParceiros.FieldByName('NOME').IsNull then
    raise Exception.Create('Nome e obrigatorio.');

  QryParceiros.SQL.Text := 'select p.ID, p.NOME, p.GRUPO_ID, g.NOME as GRUPO from PARCEIROS p inner join GRUPOPARCEIROS g on g.ID = p.GRUPO_ID';
  QryEnderecos.SQL.Text := 'select e.ID, e.PARCEIRO_ID, e.CIDADE, e.UF from ENDERECOSPARCEIRO e where e.PARCEIRO_ID = :ID';
end;

end.
