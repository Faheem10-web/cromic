import { useState, useEffect } from "react";
import "./InstallPWA.css";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Capture beforeinstallprompt for Chrome / Android / Edge / Desktop
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    // Detect iOS Safari
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);

    if (isIOS || isSafari) {
      setShowIOSModal(true);
    }
  };

  if (isInstalled || dismissed) return null;
  if (!deferredPrompt && !showIOSModal && !/iPhone|iPad|iPod/i.test(navigator.userAgent)) return null;

  return (
    <>
      {/* Floating Luxury Install Button */}
      {deferredPrompt && (
        <div className="pwa-install-banner">
          <div className="pwa-install-content">
            <img src="/icons/android-192.png" alt="CROMIC" className="pwa-icon" />
            <div className="pwa-text">
              <span className="pwa-title">CROMIC APP</span>
              <span className="pwa-subtitle">Experience Vision Redefined</span>
            </div>
          </div>
          <div className="pwa-actions">
            <button className="pwa-install-btn" onClick={handleInstallClick}>
              INSTALL
            </button>

            <button className="pwa-close-btn" onClick={() => setDismissed(true)} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Add to Home Screen Instructions Modal */}
      {showIOSModal && (
        <div className="pwa-ios-overlay" onClick={() => setShowIOSModal(false)}>
          <div className="pwa-ios-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pwa-ios-close" onClick={() => setShowIOSModal(false)}>✕</button>
            <img src="/assets/cromic.png" alt="CROMIC" className="pwa-ios-logo" />
            <h3>INSTALL CROMIC APP</h3>
            <p>Install CROMIC on your iOS device for a luxury native app experience.</p>
            <div className="pwa-ios-steps">
              <div className="ios-step">
                <span className="step-num">1</span>
                <span>Tap the <strong>Share button</strong> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> in Safari.</span>
              </div>
              <div className="ios-step">
                <span className="step-num">2</span>
                <span>Scroll down and select <strong>"Add to Home Screen"</strong> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="4"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>.</span>
              </div>
            </div>
            <button className="pwa-ios-done-btn" onClick={() => setShowIOSModal(false)}>Got It</button>
          </div>
        </div>
      )}
    </>
  );
}
