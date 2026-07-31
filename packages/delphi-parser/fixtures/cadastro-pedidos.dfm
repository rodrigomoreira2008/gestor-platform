object FrmPedidos: TFrmPedidos
  Caption = 'Cadastro de Pedidos'
  object PageControlCadastro: TPageControl
    object TabDados: TTabSheet
      Caption = 'Dados gerais'
      object EdtNumero: TDBEdit
        DataSource = DsPedidos
        DataField = 'NUMERO'
      end
      object EdtData: TDBDateTimePicker
        DataSource = DsPedidos
        DataField = 'DATA_EMISSAO'
      end
      object CboCliente: TDBLookupComboBox
        DataSource = DsPedidos
        DataField = 'CLIENTE_ID'
        ListSource = DsClientes
        KeyField = 'ID'
        ListField = 'NOME'
      end
      object EdtTotal: TDBNumberEdit
        DataSource = DsPedidos
        DataField = 'VALOR_TOTAL'
      end
    end
    object TabItens: TTabSheet
      Caption = 'Itens'
      object GridItens: TDBGrid
        DataSource = DsItensPedido
      end
    end
  end
end
