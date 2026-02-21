import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import StarfieldBackground from '../components/StarfieldBackground';
import logo from '../logo.png';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <StarfieldBackground starCount={3500} speedMultiplier={0.9}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          px: 2,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at top, rgba(53, 66, 151, 0.45) 0%, rgba(3, 8, 25, 0.92) 60%)',
            backdropFilter: 'blur(10px)',
          }}
        />
        <Paper
          elevation={10}
          sx={{
            position: 'relative',
            zIndex: 1,
            p: { xs: 4, sm: 6 },
            width: '100%',
            maxWidth: 520,
            borderRadius: 4,
            background: 'rgba(13, 17, 38, 0.85)',
            color: 'white',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
            mx: 'auto',
          }}
        >
          <Box textAlign="center" mb={4}>
            <Box
              component="img"
              src={logo}
              alt="HP Solutions logo"
              sx={{ width: { xs: 300, sm: 300 }, height: 'auto', borderRadius: 2, mb: 2, boxShadow: '0 12px 32px rgba(0,0,0,0.35)' }}
            />
          
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Authenticate to resume control of your fleet command operations.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                },
                '& label': { color: 'rgba(255,255,255,0.6)' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
                sx: {
                  color: 'white',
                },
              }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                },
                '& label': { color: 'rgba(255,255,255,0.6)' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  color: 'white',
                },
              }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #726bff 0%, #927fff 100%)',
                boxShadow: '0 16px 40px rgba(114,107,255,0.35)',
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Don't have an account?{' '}
                <Link component={RouterLink} to="/signup" variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>

          <Box mt={4} p={2.5} borderRadius={3} sx={{ background: 'rgba(12,16,32,0.8)' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} display="block" textAlign="center">
              Demo Credentials
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} display="block" textAlign="center">
              Admin — admin@inventory.com / admin123
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} display="block" textAlign="center">
              Operator — user@inventory.com / user123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </StarfieldBackground>
  );
}





