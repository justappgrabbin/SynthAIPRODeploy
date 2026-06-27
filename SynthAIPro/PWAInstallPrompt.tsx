import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during install:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Android prompt
  if (!isIOS && showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-2xl z-50 rounded-t-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5" />
            <div>
              <p className="font-semibold">Install SYNTHAI 🪷</p>
              <p className="text-sm text-blue-100">Add to your home screen</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-blue-500"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Install
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // iOS instructions
  if (isIOS && !showPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-2xl z-50 rounded-t-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5" />
            <div>
              <p className="font-semibold">Install SYNTHAI 🪷</p>
              <p className="text-sm text-purple-100">Tap Share, then Add to Home Screen</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-purple-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
