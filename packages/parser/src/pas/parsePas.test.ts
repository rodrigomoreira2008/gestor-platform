import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePas } from './parsePas.js';

const SAMPLE_PAS = `
unit CadastroPedidos;

interface

uses
  System.SysUtils, Vcl.Forms, Data.DB;

type
  TFrmCadastroPedidos = class(TForm)
  end;

implementation

procedure TFrmCadastroPedidos.btnSalvarClick(Sender: TObject);
begin
  qry.SQL.Text := 'select * from PEDIDOS where ID = :ID';
  qry.Open;
end;

function Soma(A: Integer; B: Integer): Integer;
begin
  Result := A + B;
end;

end.
`;

test('parsePas identifica unit, uses, classes e métodos', () => {
  const unit = parsePas(SAMPLE_PAS);

  assert.equal(unit.name, 'CadastroPedidos');
  assert.deepEqual(unit.uses, ['System.SysUtils', 'Vcl.Forms', 'Data.DB']);
  assert.equal(unit.classes.length, 1);
  assert.equal(unit.classes[0].name, 'TFrmCadastroPedidos');
  assert.equal(unit.classes[0].methods[0].name, 'btnSalvarClick');
});

test('parsePas extrai SQL literal de métodos', () => {
  const unit = parsePas(SAMPLE_PAS);

  assert.equal(unit.sqlBlocks.length, 1);
  assert.equal(unit.sqlBlocks[0].method, 'btnSalvarClick');
  assert.equal(unit.sqlBlocks[0].text, 'select * from PEDIDOS where ID = :ID');
});
