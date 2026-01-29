import { useEffect, useState } from 'react';

const MobileAuthCallback = () => {
  const [showManualButton, setShowManualButton] = useState(false);

  useEffect(() => {
    // Capture hash fragment and redirect to app scheme
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Build redirect URL with all parameters
    let params = '';
    if (hash) {
      params = hash.substring(1); // Remove the # symbol
    }
    if (search) {
      const searchParams = search.substring(1); // Remove the ? symbol
      params = params ? `${params}&${searchParams}` : searchParams;
    }
    
    const redirectUrl = `com.franmilla.sparky://auth/callback${params ? '?' + params : ''}`;
    
    // Attempt redirect
    window.location.href = redirectUrl;
    
    // Show manual button after 2 seconds if redirect didn't work
    const timer = setTimeout(() => {
      setShowManualButton(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualOpen = () => {
    window.location.href = 'com.franmilla.sparky://';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* Spinner */}
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        
        <p className="text-lg text-foreground font-medium">
          Abriendo Sparky...
        </p>
        
        {showManualButton && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-sm text-muted-foreground">
              ¿No se abrió automáticamente?
            </p>
            <button
              onClick={handleManualOpen}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Abrir Sparky manualmente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAuthCallback;
