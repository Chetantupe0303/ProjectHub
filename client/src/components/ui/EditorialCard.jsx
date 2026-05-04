"use client";

import { Box, Typography, Button, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {motion} from "framer-motion";

const EditorialCard = ({
  label,
  labelColor = "#737373",
  headline,
  headlineColor = "#FFFFFF",
  description,
  descriptionColor = "#737373",
  accent = "bar",
  accentColor = "#FF3D00",
  action,
  actionText = "Learn More",
  actionHref = "#",
  className = "",
  children,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const resolvedLabelColor = labelColor === "#737373" ? theme.palette.text.secondary : labelColor;
  const resolvedHeadlineColor = headlineColor === "#FFFFFF" ? theme.palette.text.primary : headlineColor;
  const resolvedDescriptionColor = descriptionColor === "#737373" ? theme.palette.text.secondary : descriptionColor;
  const surfaceColor = isDark ? alpha(theme.palette.background.paper, 0.9) : theme.palette.background.paper;
  const borderColor = isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.08);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
      style={{
        backgroundColor: surfaceColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 0,
        padding: "24px",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "border-color 0.2s ease, background-color 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {accent === "bar" && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "64px",
            height: "2px",
            bgcolor: accentColor,
          }}
        />
      )}

      {accent === "border" && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            bgcolor: accentColor,
          }}
        />
      )}

      {label && (
        <Typography
          sx={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.7rem",
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: resolvedLabelColor,
            mb: 2,
            mt: accent === "bar" ? 1 : 0,
          }}
        >
          {label}
        </Typography>
      )}

      {headline !== undefined && headline !== null && (
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontSize: { xs: "1.75rem", md: "2.25rem" },
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: resolvedHeadlineColor,
            mb: 2,
          }}
        >
          {headline}
        </Typography>
      )}

      {description && (
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "1rem",
            fontWeight: 400,
            lineHeight: 1.6,
            color: resolvedDescriptionColor,
            mb: 3,
            flexGrow: 1,
          }}
        >
          {description}
        </Typography>
      )}

      {children}

      {action && (
        <Box sx={{ mt: "auto" }}>
          <Button
            href={actionHref}
            sx={{
              color: resolvedHeadlineColor,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              p: 0,
              minWidth: "auto",
              alignItems: "flex-start",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "1px",
                backgroundColor: accentColor,
                transform: "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.3s ease",
              },
              "&:hover::after": {
                transform: "scaleX(1)",
              },
            }}
          >
            {actionText}
          </Button>
        </Box>
      )}
    </motion.div>
  );
};

export { EditorialCard };
