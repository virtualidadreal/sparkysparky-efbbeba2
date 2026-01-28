import { useEffect } from 'react';

const MobileCallback = () => {
  useEffect(() => {
    // Capture all URL parameters (query string + hash)
    const params = window.location.search + window.location.hash;
    
    // Redirect to the iOS app with the same parameters
    window.location.href = 'com.franmilla.sparky://auth/callback' + params;
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-foreground font-medium mb-2">Redirigiendo a la app...</p>
        <p className="text-muted-foreground text-sm">
          Si no se abre automáticamente, abre Sparky manualmente.
        </p>
      </div>
    </div>
  );
};

export default MobileCallback;
