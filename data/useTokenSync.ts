import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hybridDataService } from './hybridDataService';

/**
 * Hook to synchronize JWT tokens between AuthContext and HybridDataService
 * This ensures API calls are authenticated when a user is logged in
 */
export function useTokenSync() {
  const { accessToken, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Set token in hybrid data service for API calls
      if (accessToken === 'local_session') {
        // Clear token for local sessions
        hybridDataService.clearToken();
      } else {
        // Set server token with 15 minute expiry (default for JWT access tokens)
        hybridDataService.setAccessToken(accessToken, '15m');
      }
    } else {
      // Clear token when not authenticated
      hybridDataService.clearToken();
    }
  }, [accessToken, isAuthenticated]);

  return { tokenSynced: true };
}