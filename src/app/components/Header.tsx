// components/Header.js
import React from 'react';
import { AppBar, Toolbar, Typography, Avatar } from '@mui/material';


type User = {
  email: string
  displayName: string
  image: string
  userId: string
}

const Header = ({ user }: { user: User }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          FIAP FrameExtractor
        </Typography>
        <Typography variant="subtitle1" style={{ marginRight: '16px' }}>
          {user.email}
        </Typography>
        <Avatar alt={user.displayName} src={user.image} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;