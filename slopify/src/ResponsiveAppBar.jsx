import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { NavLink } from 'react-router-dom';
import UserContext from './UserContext';

const pages = ['Map', 'Events', 'My Events'];
const settings = ['Profile', 'Logout'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const { me, refetchMe, isLoading: isAuthLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_SERVER_URL;

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${apiUrl}/logout`, { method: 'POST', credentials: 'include' });
      navigate('/login')
      await refetchMe();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getLink = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-')
  };

  // Redirect if already logged in and auth state is resolved
  useEffect(() => {
    if (!isAuthLoading && me) {
      return
    }
  }, [me, isAuthLoading, navigate]);

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/*  MOBILE */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            {me ? (<>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {pages.map((page) => (
                  <MenuItem key={page}>
                    <NavLink
                      to={`/${getLink(page)}`} // Generate URL
                      key={page}
                      onClick={handleCloseNavMenu}
                      style={({ isActive }) => ({
                        my: 2,
                        display: 'block',
                        textDecoration: 'none', // Remove underline from NavLink
                        fontWeight: isActive ? 'bold' : 'normal', // Make font bold when active
                        color: isActive ? 'rgba(63,81,181, 0.5)' : 'black', // Example: Add background color when active
                        padding: '8px 16px', // Add some padding
                        borderRadius: '4px', // Add some rounded corners
                        textTransform: 'uppercase',
                      })}
                    >
                      {page}
                    </NavLink>
                  </MenuItem>
                ))}
              </Menu>
            </>) : (<></>)}
          </Box>

          {/* Slopify Logo Mobile */}
          <Box sx={{
            display: { xs: 'flex', md: 'none' },
            flexGrow: 1,
          }}>
            <img src="/20250318_102327_slopify.png" alt="Logo" height="30" />
          </Box>

          {/* Slopify Logo */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
            <img src="/20250318_102327_slopify.png" alt="Logo" height="30" />
          </Box>

          {me ? (
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <NavLink
                  to={`/${getLink(page)}`}
                  key={page}
                  style={({ isActive }) => ({
                    my: 2,
                    color: 'white',
                    display: 'block',
                    textDecoration: 'none', // Remove underline from NavLink
                    backgroundColor: isActive ? 'rgba(63,81,181, 0.5)' : 'transparent', // Example: Add background color when active
                    padding: '8px 16px', // Add some padding
                    borderRadius: '4px', // Add some rounded corners
                    textTransform: 'uppercase',
                  })}
                >
                  {page}
                </NavLink>
              ))}
            </Box>
          ) : (
            <></>
          )}

          {me ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Piiiigue" src="/Pigue.png" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting}
                    onClick={() => {
                      handleCloseUserMenu();
                      if (setting === 'Logout') {
                        handleLogout();
                      }
                    }}>
                    <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            <></>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
