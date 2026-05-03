STEP 2: BACKEND SETUP (LARAVEL BREEZE API)
Directory: Root

Bash
composer create-project laravel/laravel backend
cd backend
composer require laravel/breeze --dev
php artisan breeze:install api

# Setup SQLite
touch database/database.sqlite
sed -i 's/DB_CONNECTION=.*/DB_CONNECTION=sqlite/' .env
sed -i '/DB_DATABASE=/d' .env
echo "DB_DATABASE=$(pwd)/database/database.sqlite" >> .env

# Configure URLs
sed -i 's/APP_URL=.*/APP_URL=http:\/\/localhost:8000/' .env
sed -i 's/FRONTEND_URL=.*/FRONTEND_URL=http:\/\/localhost:3000/' .env
echo "SESSION_DOMAIN=localhost" >> .env
echo "SANCTUM_STATEFUL_DOMAINS=localhost:3000" >> .env

php artisan migrate
cd ..
STEP 3: FRONTEND SETUP (NEXT.JS + MUI)
Directory: Root

Bash
# 1. Install Next.js
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes

# 2. Install MUI & Emotion
cd frontend
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @fontsource/roboto
npm install axios
cd ..
STEP 4: CREATE MUI THEME & BOILERPLATE
INSTRUCTION: Create these files to ensure MUI works correctly with Next.js App Router.

File: frontend/src/app/theme.ts
TypeScript
'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
File: frontend/src/app/layout.tsx (Root Layout with Provider)
TypeScript
import theme from './theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
File: frontend/src/app/(dashboard)/layout.tsx (MUI Dashboard Layout)
TypeScript
'use client';
import React from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';

const drawerWidth = 240;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            OPI Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {['Dashboard', 'Users', 'Settings'].map((text) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
File: frontend/src/app/(dashboard)/page.tsx
TypeScript
'use client';
import { Grid, Paper, Typography, Box } from '@mui/material';

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Dashboard Overview</Typography>
      <Grid container spacing={3}>
        {[ { label: 'Total Users', value: '1,240' }, { label: 'Revenue', value: '$12,450' }, { label: 'Active', value: '342' } ].map((stat) => (
          <Grid item xs={12} md={4} key={stat.label}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">{stat.label}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
STEP 5: RUN
Terminal 1: cd backend && php artisan serve
Terminal 2: cd frontend && npm run dev