import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuIcon from '@mui/icons-material/Menu';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { AppBar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';
import { CadastroProdutosPage } from '../modules/produtos/pages/CadastroProdutosPage';

const drawerWidth = 280;

type AppPage = 'dashboard' | 'produtos' | 'migracao';

export function App() {
  const [page, setPage] = useState<AppPage>('dashboard');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            GestorLoc Web
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }
        }}
      >
        <Toolbar />
        <List>
          <ListItemButton selected={page === 'dashboard'} onClick={() => setPage('dashboard')}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton selected={page === 'produtos'} onClick={() => setPage('produtos')}>
            <ListItemIcon>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Produtos" />
          </ListItemButton>
          <ListItemButton selected={page === 'migracao'} onClick={() => setPage('migracao')}>
            <ListItemIcon>
              <SyncAltIcon />
            </ListItemIcon>
            <ListItemText primary="Migração Delphi" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        {page === 'dashboard' && <DashboardPage />}
        {page === 'produtos' && <CadastroProdutosPage />}
        {page === 'migracao' && <MigrationPage />}
      </Box>
    </Box>
  );
}

function DashboardPage() {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Gestor Platform
      </Typography>
      <Typography color="text.secondary">
        Base React inicial preparada para receber telas geradas pela DSL do GestorLoc.
      </Typography>
    </>
  );
}

function MigrationPage() {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Migração Delphi
      </Typography>
      <Typography color="text.secondary">
        Área de acompanhamento dos artefatos migrados do GestorLoc.
      </Typography>
    </>
  );
}
