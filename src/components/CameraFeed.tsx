import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Camera, Video, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Detection } from '@/types/proctor';
import { cn } from '@/lib/utils';

interface CameraFeedProps {
  detections: Detection[];
}

export interface CameraFeedHandle {
  captureFrame: () => string | null;
}

export const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(
  ({ detections }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCamera, setHasCamera] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        if (!videoRef.current || !canvasRef.current || !hasCamera) return null;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return null;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    }));

    useEffect(() => {
      async function setupCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' },
            audio: false,
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasCamera(true);
          }
        } catch (err) {
          console.error('Camera access error:', err);
          setCameraError('Unable to access camera. Please check permissions.');
        }
      }

      setupCamera();

      return () => {
        if (videoRef.current?.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }, []);

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Live Camera Monitor</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-xs font-medium text-success">Monitoring</span>
          </div>
        </div>

        {/* Video Feed */}
        <div className="relative flex-1 rounded-xl overflow-hidden bg-muted border border-border">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <p className="text-sm text-center text-muted-foreground">{cameraError}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              {!hasCamera && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted">
                  <Video className="w-12 h-12 text-muted-foreground animate-pulse" />
                  <p className="text-sm text-muted-foreground">Connecting to camera...</p>
                </div>
              )}
              {hasCamera && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-destructive/90 text-destructive-foreground text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse"></span>
                  REC
                </div>
              )}
            </>
          )}
        </div>

        {/* Detection Panel */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Detections</h3>
          <div className="grid grid-cols-2 gap-2">
            {detections.map((detection) => (
              <div
                key={detection.item}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                  detection.status === 'clear'
                    ? "bg-card border-border"
                    : "bg-destructive/10 border-destructive/30"
                )}
              >
                <span className="text-sm font-medium text-foreground">{detection.item}</span>
                {detection.status === 'clear' ? (
                  <div className="flex items-center gap-1 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Clear</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Detected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

CameraFeed.displayName = 'CameraFeed';
