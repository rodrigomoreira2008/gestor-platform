object FrmCadastroProdutos: TFrmCadastroProdutos
  Caption = 'Cadastro de Produtos'
  object PageControl1: TPageControl
    object TabDados: TTabSheet
      Caption = 'Dados'
      object EdtDescricao: TDBEdit
        DataSource = DsProdutos
        DataField = 'DESCRICAO'
      end
      object CmbGrupo: TDBLookupComboBox
        DataSource = DsProdutos
        DataField = 'GRUPO_ID'
        ListSource = DsGrupoProdutos
        KeyField = 'ID'
        ListField = 'NOME'
      end
      object ChkAtivo: TDBCheckBox
        DataSource = DsProdutos
        DataField = 'ATIVO'
      end
    end
    object TabEstoque: TTabSheet
      Caption = 'Estoque'
      object EdtQuantidade: TDBEdit
        DataSource = DsProdutos
        DataField = 'QUANTIDADE'
      end
      object GridMovimentos: TDBGrid
        DataSource = DsMovimentos
      end
    end
  end
  object BtnGravar: TButton
    Caption = 'Gravar'
  end
end
