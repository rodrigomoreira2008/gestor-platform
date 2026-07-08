object FrmCadastroGrupoProdutos: TFrmCadastroGrupoProdutos
  Caption = 'Cadastro de Grupo de Produtos'
  object PageControl1: TPageControl
    object TabDados: TTabSheet
      Caption = 'Dados'
      object EdtNome: TDBEdit
        DataSource = DsGrupoProdutos
        DataField = 'NOME'
      end
      object EdtControle: TDBEdit
        DataSource = DsGrupoProdutos
        DataField = 'CONTROLE'
      end
      object CmbStatus: TDBComboBox
        DataSource = DsGrupoProdutos
        DataField = 'STATUS'
      end
    end
  end
  object BtnGravar: TButton
    Caption = 'Gravar'
  end
end
