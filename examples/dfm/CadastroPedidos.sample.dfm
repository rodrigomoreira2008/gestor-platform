object FrmCadastroPedidos: TFrmCadastroPedidos
  Caption = 'Cadastro de Pedidos'
  object edtPedido: TDBEdit
    DataField = 'PEDIDO'
    ReadOnly = True
  end
  object edtCliente: TDBEdit
    DataField = 'CLIENTE'
  end
  object edtDataLocacao: TDBEdit
    DataField = 'DATA_LOCACAO'
  end
  object edtValorTotal: TDBEdit
    DataField = 'VALOR_TOTAL'
  end
  object memoObservacao: TDBMemo
    DataField = 'OBSERVACAO'
  end
  object gridItens: TDBGrid
    DataSource = dsItens
  end
end
