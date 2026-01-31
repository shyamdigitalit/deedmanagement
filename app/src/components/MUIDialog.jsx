import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton, } from '@mui/material';
import { ArrowForward, Close } from '@mui/icons-material';
import * as styles from './../styles/DialogStyle';

const MUIDialog = ({ open, onClose, icon, title, description, content, actions, fullWidth = true, maxWidth = 'sm', }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={styles.dialogTitleStyles}>
        <Box sx={styles.headerWrapper}>
          <Box sx={styles.leftSection}>
            <Box sx={styles.iconCircle}>{icon}</Box>

            <Box>
              <Typography sx={styles.titleText}>{title}</Typography>
              <Typography sx={styles.descriptionText}>{description}</Typography>
            </Box>
          </Box>

          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {content}
      </DialogContent>

      {/* {actions && <DialogActions>{actions}</DialogActions>} */}
      

      {/* <DialogActions sx={styles.dialogActions}>
        <Button sx={styles.secondaryButton}>Continue to step 2</Button>
        <Button sx={styles.primaryButton}>Save Changes</Button>
      </DialogActions> */}
    </Dialog>

  );
};

export default MUIDialog;
