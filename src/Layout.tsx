import { useState } from 'react';
import { 
  Box, 
  CssBaseline, 
  Drawer, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  AppBar,
  Typography,
  IconButton,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Container,
  Button,
} from '@mui/material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Menu as MenuIcon,
  Logout,
  Settings,
} from '@mui/icons-material';
import { useAuth } from './contexts/AuthContext';
import { motion } from 'framer-motion';
import logo from './logo.png';

const drawerWidth = 260;

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  adminOnly?: boolean;
}

const navItems: NavigationItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/app' },
  { text: 'Products', icon: <InventoryIcon />, path: '/app/products' },
  { text: 'Suppliers', icon: <PeopleIcon />, path: '/app/suppliers', adminOnly: true },
  { text: 'Orders', icon: <AssignmentIcon />, path: '/app/orders' },
  { text: 'Movements', icon: <TimelineIcon />, path: '/app/movements' },
  { text: 'Statistics', icon: <AssessmentIcon />, path: '/app/statistics' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUserMenuAnchor(null);
  };

  const drawerContent = (
    <Box px={3} py={2} display="flex" flexDirection="column" height="100%">
      <Toolbar disableGutters sx={{ mb: 3 }}>
        <Box
          component={Link}
          to="/app"
          display="flex"
          alignItems="center"
          gap={1.5}
          sx={{ textDecoration: 'none' }}
        >
          <Box
            component="img"
            src={logo}
            alt="HP Solutions logo"
            sx={{ width: 40, height: 40, borderRadius: 2 }}
          />
          <Typography variant="h5" fontWeight={700} color="primary.main">
            HP Solutions
          </Typography>
        </Box>
      </Toolbar>
      <Box display="flex" flexDirection="column" gap={1.5} flexGrow={1} overflow="auto" pr={1}>
        {navItems
          .filter((item) => !item.adminOnly || user?.role === 'admin')
          .map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  gap: 1.5,
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.main' : 'action.hover',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'inherit' : 'text.secondary', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontWeight: 600 }} primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </Box>
      <Divider sx={{ my: 3 }} />
      <Box display="flex" alignItems="center" p={2} borderRadius={2} bgcolor="background.paper" boxShadow="soft">
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontWeight: 700 }}>
          {user?.username?.charAt(0).toUpperCase()}
        </Avatar>
        <Box ml={2} flex={1} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {user?.username}
          </Typography>
          <Chip
            label={user?.role}
            size="small"
            color={user?.role === 'admin' ? 'warning' : 'primary'}
            sx={{ mt: 0.5, fontWeight: 600 }}
          />
        </Box>
        <Button onClick={handleLogout} size="small" variant="outlined" sx={{ borderRadius: 2 }}>
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              component={Link}
              to="/app"
              display="flex"
              alignItems="center"
              gap={1.5}
              sx={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Box
                component="img"
                src={logo}
                alt="HP Solutions logo"
                sx={{ width: 32, height: 32, borderRadius: 1 }}
              />
              <Typography variant="h6" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>
                HP Solutions
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1" className="hidden sm:block">
              {user?.username}
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ className: 'mt-2' }}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Profile Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 3, md: 4, lg: 6 },
          background: (theme) => `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" disableGutters sx={{
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 0, md: 1 }
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}