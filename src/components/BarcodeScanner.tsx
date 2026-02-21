import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  QrCodeScanner as QrCodeIcon,
} from '@mui/icons-material';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  open,
  onClose,
  onScan,
  onError,
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const isScanningRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);

  const handleScan = useCallback((barcode: string) => {
    if (!scannedCodes.includes(barcode)) {
      setScannedCodes(prev => [...prev, barcode]);
      onScan(barcode);
    }
  }, [onScan, scannedCodes]);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  const startScanning = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      isScanningRef.current = true;
      setIsScanning(true);
      setError(null);

      // Check for camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setHasPermission(true);
      
      // Create video element
      const video = document.createElement('video');
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.srcObject = stream;
      video.play();

      // Clear previous content
      if (scannerRef.current) {
        scannerRef.current.innerHTML = '';
        scannerRef.current.appendChild(video);
      }

      // Initialize barcode detection (simplified version)
      // In a real implementation, you would use a library like QuaggaJS or ZXing
      const detectBarcode = () => {
        // This is a simplified implementation
        // In production, use a proper barcode detection library
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx && video.videoWidth && video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          // Simulate barcode detection
          // In reality, you would process the canvas image for barcodes
          ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // This is a mock implementation - replace with actual barcode detection
          if (Math.random() > 0.95) { // 5% chance of detecting a barcode
            const mockBarcode = `BC${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
            handleScan(mockBarcode);
          }
        }
        
        if (isScanningRef.current) {
          requestAnimationFrame(detectBarcode);
        }
      };

      video.addEventListener('loadedmetadata', () => {
        detectBarcode();
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      handleError(errorMessage);
      isScanningRef.current = false;
      setIsScanning(false);
    }
  }, [handleScan, handleError]);

  const stopScanning = useCallback(() => {
    isScanningRef.current = false;
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.innerHTML = '';
    }
    
    // Stop all media tracks
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {
        // Ignore errors when stopping tracks
      });
  }, []);

  const handleClose = useCallback(() => {
    stopScanning();
    onClose();
  }, [stopScanning, onClose]);

  const clearScannedCodes = useCallback(() => {
    setScannedCodes([]);
  }, []);

  useEffect(() => {
    if (open) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open, startScanning, stopScanning]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <QrCodeIcon color="primary" />
            <Typography variant="h6">Barcode Scanner</Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <Box
          ref={scannerRef}
          sx={{
            width: '100%',
            height: '400px',
            backgroundColor: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {!isScanning && !error && (
            <Box textAlign="center" color="white">
              <CameraIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6">Camera not started</Typography>
              <Typography variant="body2">Click start to begin scanning</Typography>
            </Box>
          )}
          
          {isScanning && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '100px',
                border: '2px solid #1976d2',
                borderRadius: 1,
                zIndex: 1,
              }}
            />
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {hasPermission === false && (
          <Alert severity="warning" sx={{ m: 2 }}>
            Camera permission denied. Please allow camera access to scan barcodes.
          </Alert>
        )}

        {scannedCodes.length > 0 && (
          <Paper sx={{ m: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Scanned Codes ({scannedCodes.length})
            </Typography>
            <Box sx={{ maxHeight: 100, overflow: 'auto' }}>
              {scannedCodes.map((code, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {code}
                </Typography>
              ))}
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={clearScannedCodes} disabled={scannedCodes.length === 0}>
          Clear History
        </Button>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner;



