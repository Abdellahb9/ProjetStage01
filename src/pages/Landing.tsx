import { Button, Box, Typography, Stack } from '@mui/material';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StarfieldBackground from '../components/StarfieldBackground';
import logo from '../logo.png';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <StarfieldBackground speedMultiplier={1.1} starCount={4500}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(27, 36, 74, 0.45) 0%, rgba(0, 0, 0, 0.8) 60%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          px: 3,
        }}
      >
        <Stack spacing={4} alignItems="center" textAlign="center" maxWidth={640}>
          <Box
            component="img"
            src={logo}
            alt="HP Solutions logo"
            sx={{ width: { xs: 96, sm: 120 }, height: 'auto', borderRadius: 4, boxShadow: '0 16px 40px rgba(0,0,0,0.45)' }}
          />
          <Typography variant="overline" sx={{ letterSpacing: 6, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
            ARMADA COMMAND CENTER
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              textShadow: '0 20px 60px rgba(0,0,0,0.45)',
            }}
          >
            Navigate the Galaxy of Inventory Intelligence
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.7 }}>
            Command real-time insights, orchestrate supplier fleets, and safeguard supply routes across every outpost in your universe.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 4,
                boxShadow: '0 16px 40px rgba(114, 107, 255, 0.4)',
                background: 'linear-gradient(135deg, #726bff 0%, #927fff 100%)',
                fontWeight: 700,
              }}
            >
              Enter Command Center
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.35)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(6px)',
              }}
            >
              Join the Fleet
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          right: 32,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: 4,
          fontSize: 12,
        }}
      >
        HP SOLUTIONS • STARFLEET EDITION
      </Box>
    </StarfieldBackground>
  );
}
