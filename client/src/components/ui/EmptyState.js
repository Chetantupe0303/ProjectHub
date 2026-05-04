import React from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  alpha,
  useTheme,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction,
  size = 'medium',
  illustration = null 
}) => {
  const theme = useTheme();

  const sizeConfig = {
    small: {
      avatarSize: 56,
      iconSize: 28,
      titleVariant: 'h6',
      descriptionVariant: 'body2',
      padding: 4
    },
    medium: {
      avatarSize: 80,
      iconSize: 40,
      titleVariant: 'h5',
      descriptionVariant: 'body1',
      padding: 6
    },
    large: {
      avatarSize: 120,
      iconSize: 60,
      titleVariant: 'h4',
      descriptionVariant: 'h6',
      padding: 8
    }
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: { xs: config.padding, md: config.padding * 1.5 },
            px: { xs: 3, md: 6 }
          }}
        >
          {/* Icon or Illustration */}
          <Box sx={{ mb: 3 }}>
            {illustration ? (
              <Box sx={{ maxWidth: 200, mx: 'auto' }}>
                {illustration}
              </Box>
            ) : (
              <Avatar
                sx={{
                  width: config.avatarSize,
                  height: config.avatarSize,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontSize: config.iconSize,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                {icon}
              </Avatar>
            )}
          </Box>

          {/* Title */}
          <Typography
            variant={config.titleVariant}
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
              maxWidth: 400
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          <Typography
            variant={config.descriptionVariant}
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
              maxWidth: 500,
              lineHeight: 1.6
            }}
          >
            {description}
          </Typography>

          {/* Action Button */}
          {actionText && onAction && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                onClick={onAction}
                sx={{
                  borderRadius: '16px',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.16)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {actionText}
              </Button>
            </motion.div>
          )}
        </Box>
      </Container>
    </motion.div>
  );
};

export default EmptyState;
