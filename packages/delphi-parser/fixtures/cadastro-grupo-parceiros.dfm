object FrmCadastroGrupoParceiros: TFrmCadastroGrupoParceiros
  Caption = 'Cadastro de Grupo de Parceiros'
  object PageControl1: TPageControl
    object TabDados: TTabSheet
      Caption = 'Dados'
      object EdtNome: TDBEdit
        DataSource = DsGrupoParceiros
        DataField = 'NOME'
      end
      object EdtControle: TDBEdit
        DataSource = DsGrupoParceiros
        DataField = 'CONTROLE'
      end
      object CmbStatus: TDBComboBox
        DataSource = DsGrupoParceiros
        DataField = 'STATUS'
      end
    end
  end
  object BtnSalvar: TButton
    Caption = 'Salvar'
  end
end
