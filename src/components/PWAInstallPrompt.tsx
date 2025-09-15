"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { XMarkIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);
      
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(iOS);
      
      if (!iOS && !standalone) {
        const dismissed = sessionStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowInstallPrompt(true);
        }
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    checkInstalled();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const timer = setTimeout(() => {
      if (!isInstalled && !isStandalone && !isIOS) {
        setShowInstallPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isInstalled, isStandalone, isIOS]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-50 max-w-sm mx-auto">
      <Card className="bg-white shadow-2xl border-2 border-orange-200 backdrop-blur-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              Install FlavorFlow
            </h3>
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full p-1.5 shadow-sm touch-manipulation"
            >
              <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 bg-white">
          <div className="space-y-3">
            <p className="text-sm sm:text-base font-medium text-gray-700">
              Install FlavorFlow for offline access and faster loading.
            </p>
            
            {isIOS ? (
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">Install on iOS:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>1. Tap the Share button</p>
                  <p>2. Scroll down and tap "Add to Home Screen"</p>
                </div>
              </div>
            ) : deferredPrompt ? (
              <Button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg touch-manipulation min-h-[44px]"
                size="lg"
              >
                <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
                Install App
              </Button>
            ) : (
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">Install options:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• Look for the install icon in your browser's address bar</p>
                  <p>• Use your browser's menu to install</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
