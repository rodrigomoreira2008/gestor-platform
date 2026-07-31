object FrmCadastroParceiros: TFrmCadastroParceiros
  Caption = 'Cadastro de Parceiros'
  object PageControl1: TPageControl
    object TabDados: TTabSheet
      Caption = 'Dados'
      object EdtNome: TDBEdit
        DataSource = DsParceiros
        DataField = 'NOME'
      end
      object CmbGrupo: TDBLookupComboBox
        DataSource = DsParceiros
        DataField = 'GRUPO_ID'
        ListSource = DsGrupoParceiros
        KeyField = 'ID'
        ListField = 'NOME'
      end
      object ChkAtivo: TDBCheckBox
        DataSource = DsParceiros
        DataField = 'ATIVO'
      end
    end
    object TabEnderecos: TTabSheet
      Caption = 'Enderecos'
      object GridEnderecos: TDBGrid
        DataSource = DsEnderecos
      end
    end
  end
  object BtnSalvar: TButton
    Caption = 'Salvar'
  end
end
