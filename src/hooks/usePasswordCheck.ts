import { useState, useCallback } from 'react';

interface PasswordCheckResult {
  isPwned: boolean;
  occurrences: number;
  error?: string;
}

export const usePasswordCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkPassword = useCallback(async (password: string): Promise<PasswordCheckResult> => {
    if (!password || password.length < 1) {
      return { isPwned: false, occurrences: 0 };
    }

    setIsChecking(true);

    try {
      // Convert password to SHA-1 hash
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      // Use k-anonymity: only send first 5 chars of hash
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);

      // Query HaveIBeenPwned API
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: {
          'Add-Padding': 'true' // Adds padding to prevent response size analysis
        }
      });

      if (!response.ok) {
        throw new Error('Error checking password');
      }

      const text = await response.text();
      const lines = text.split('\n');

      // Check if our suffix appears in the response
      for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix.trim() === suffix) {
          const occurrences = parseInt(count.trim(), 10);
          return { isPwned: true, occurrences };
        }
      }

      return { isPwned: false, occurrences: 0 };
    } catch (error) {
      console.error('Error checking password:', error);
      return { 
        isPwned: false, 
        occurrences: 0, 
        error: 'No se pudo verificar la contraseña' 
      };
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { checkPassword, isChecking };
};
