import assert from 'node:assert/strict';
import test from 'node:test';
import { dfmToGestorForm } from './toGestorForm.js';
import { parseDfm } from './parseDfm.js';

const SAMPLE_DFM = `
object FrmPedido: TFrmPedido
  Caption = 'Pedido de Locação'
  object edtCodigo: TDBEdit
    DataField = 'CODIGO'
    ReadOnly = True
  end
  object edtCliente: TDBEdit
    DataField = 'CLIENTE'
  end
  object dbGridItens: TDBGrid
    DataSource = dsItens
  end
end
`;

test('parseDfm extrai componentes e propriedades básicas', () => {
  const result = parseDfm(SAMPLE_DFM);

  assert.equal(result.root?.name, 'FrmPedido');
  assert.equal(result.root?.className, 'TFrmPedido');
  assert.equal(result.components.length, 4);
  assert.equal(result.components[1].properties.DataField, 'CODIGO');
});

test('dfmToGestorForm converte controles Delphi em campos DSL', () => {
  const form = dfmToGestorForm(parseDfm(SAMPLE_DFM), 'CadastroPedidos.dfm');

  assert.equal(form.version, '0.1');
  assert.equal(form.title, 'Pedido de Locação');
  assert.equal(form.fields.length, 3);
  assert.equal(form.fields[0].name, 'codigo');
  assert.equal(form.fields[0].readOnly, true);
  assert.equal(form.fields[2].type, 'grid');
});
