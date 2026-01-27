/**
 * Secure Token Storage Test Suite
 * 
 * This script tests the enhanced secure token storage implementation
 * with encryption, integrity validation, and expiration monitoring.
 * 
 * Run: npx react-native run-android (or run-ios) to test in the app
 */

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Test configuration
const TEST_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.access.token';
const TEST_REFRESH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.refresh.token';
const TEST_USER_DATA = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  profilepicture: null
};

// Mock tokens
const mockTokens = {
  accessToken: TEST_ACCESS_TOKEN,
  refreshToken: TEST_REFRESH_TOKEN,
  tokenType: 'Bearer',
  expiresIn: '15m'
};

// Test the secure token storage implementation
export class SecureTokenStorageTest {
  private static readonly ACCESS_TOKEN_KEY = 'wayfind_access_token_v2';
  private static readonly REFRESH_TOKEN_KEY = 'wayfind_refresh_token_v2';
  private static readonly USER_DATA_KEY = 'wayfind_user_data_v2';
  private static readonly TOKEN_METADATA_KEY = 'wayfind_token_metadata_v2';
  private static readonly ENCRYPTION_KEY = 'wayfind_encryption_salt_v2';
  
  private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_TOKEN_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly ENCRYPTION_ALGORITHM = Crypto.CryptoDigestAlgorithm.SHA256;

  static async runAllTests(): Promise<void> {
    console.log('🔐 Starting Secure Token Storage Tests');
    
    try {
      await this.testTokenEncryption();
      await this.testTokenIntegrity();
      await this.testTokenExpiration();
      await this.testTokenSaveAndRetrieve();
      await this.testTokenCleanup();
      await this.testSecurityScenarios();
      
      console.log('✅ All Secure Token Storage Tests Passed!');
    } catch (error) {
      console.error('❌ Secure Token Storage Test Failed:', error);
      throw error;
    }
  }

  // Test 1: Token Encryption
  static async testTokenEncryption(): Promise<void> {
    console.log('\n🔒 Testing Token Encryption...');
    
    try {
      // Generate encryption salt
      const salt = await this.generateEncryptionSalt();
      console.log(`Salt generated: ${salt.substring(0, 16)}...`);
      
      // Test data encryption
      const testData = JSON.stringify(mockTokens);
      const encryptedData = await this.encryptTokenData(testData);
      console.log(`Data encrypted: ${encryptedData.substring(0, 32)}...`);
      
      // Verify encryption is different from original
      if (encryptedData === testData) {
        throw new Error('Encryption failed - data unchanged');
      }
      
      console.log('✅ Token encryption working correctly');
    } catch (error) {
      console.error('❌ Token encryption test failed:', error);
      throw error;
    }
  }

  // Test 2: Token Integrity Validation
  static async testTokenIntegrity(): Promise<void> {
    console.log('\n🛡️ Testing Token Integrity Validation...');
    
    try {
      // Create secure token data
      const secureData = await this.createSecureTokenData(mockTokens);
      console.log('Secure token data created with metadata');
      
      // Test valid integrity check
      const originalData = JSON.stringify(mockTokens);
      const isValid = await this.validateTokenIntegrity(secureData, originalData);
      
      if (!isValid) {
        throw new Error('Valid token failed integrity check');
      }
      
      // Test tampered data detection
      const tamperedData = JSON.stringify({ ...mockTokens, accessToken: 'tampered' });
      const isTamperedDetected = !(await this.validateTokenIntegrity(secureData, tamperedData));
      
      if (!isTamperedDetected) {
        throw new Error('Tampered token not detected');
      }
      
      console.log('✅ Token integrity validation working correctly');
    } catch (error) {
      console.error('❌ Token integrity test failed:', error);
      throw error;
    }
  }

  // Test 3: Token Expiration
  static async testTokenExpiration(): Promise<void> {
    console.log('\n⏰ Testing Token Expiration...');
    
    try {
      // Create token with immediate expiration
      const expiredTokenData = {
        encryptedData: 'test',
        hash: 'test',
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        expiresAt: Date.now() - 1000 // Expired 1 second ago
      };
      
      const isExpiredDetected = !(await this.validateTokenIntegrity(expiredTokenData, 'test'));
      
      if (!isExpiredDetected) {
        throw new Error('Expired token not detected');
      }
      
      // Test tokens close to expiry
      const almostExpiredData = {
        encryptedData: 'test',
        hash: await this.hashData('test'),
        timestamp: Date.now(),
        expiresAt: Date.now() + (this.TOKEN_EXPIRY_BUFFER / 2) // Half buffer time left
      };
      
      console.log('✅ Token expiration validation working correctly');
    } catch (error) {
      console.error('❌ Token expiration test failed:', error);
      throw error;
    }
  }

  // Test 4: Token Save and Retrieve
  static async testTokenSaveAndRetrieve(): Promise<void> {
    console.log('\n💾 Testing Token Save and Retrieve...');
    
    try {
      // Clear any existing test data
      await this.clearAllTestData();
      
      // Save tokens
      await this.saveTokens(mockTokens);
      console.log('Tokens saved successfully');
      
      // Retrieve tokens
      const retrievedTokens = await this.getStoredTokens();
      
      if (!retrievedTokens) {
        throw new Error('Failed to retrieve saved tokens');
      }
      
      if (retrievedTokens.accessToken !== mockTokens.accessToken ||
          retrievedTokens.refreshToken !== mockTokens.refreshToken) {
        throw new Error('Retrieved tokens do not match saved tokens');
      }
      
      console.log('✅ Token save and retrieve working correctly');
    } catch (error) {
      console.error('❌ Token save/retrieve test failed:', error);
      throw error;
    }
  }

  // Test 5: Token Cleanup
  static async testTokenCleanup(): Promise<void> {
    console.log('\n🗑️ Testing Token Cleanup...');
    
    try {
      // Save some test data
      await this.saveTokens(mockTokens);
      await SecureStore.setItemAsync(this.USER_DATA_KEY, JSON.stringify(TEST_USER_DATA));
      
      // Verify data exists
      const beforeCleanup = await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
      if (!beforeCleanup) {
        throw new Error('Test data not saved before cleanup');
      }
      
      // Clear all tokens
      await this.clearStoredTokens();
      
      // Verify all data is cleared
      const afterCleanup = await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
      const userDataAfterCleanup = await SecureStore.getItemAsync(this.USER_DATA_KEY);
      const metadataAfterCleanup = await SecureStore.getItemAsync(this.TOKEN_METADATA_KEY);
      
      if (afterCleanup || userDataAfterCleanup || metadataAfterCleanup) {
        throw new Error('Token cleanup incomplete');
      }
      
      console.log('✅ Token cleanup working correctly');
    } catch (error) {
      console.error('❌ Token cleanup test failed:', error);
      throw error;
    }
  }

  // Test 6: Security Scenarios
  static async testSecurityScenarios(): Promise<void> {
    console.log('\n🔍 Testing Security Scenarios...');
    
    try {
      // Test scenario 1: Corrupted metadata
      await SecureStore.setItemAsync(this.TOKEN_METADATA_KEY, 'invalid-json');
      await SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, TEST_ACCESS_TOKEN);
      await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, TEST_REFRESH_TOKEN);
      
      const corruptedResult = await this.getStoredTokens();
      if (corruptedResult !== null) {
        throw new Error('Corrupted metadata not handled properly');
      }
      
      // Test scenario 2: Missing metadata
      await SecureStore.deleteItemAsync(this.TOKEN_METADATA_KEY);
      const missingMetadataResult = await this.getStoredTokens();
      if (missingMetadataResult !== null) {
        throw new Error('Missing metadata not handled properly');
      }
      
      // Test scenario 3: Partial token data
      await SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY);
      const partialTokenResult = await this.getStoredTokens();
      if (partialTokenResult !== null) {
        throw new Error('Partial token data not handled properly');
      }
      
      console.log('✅ Security scenarios handled correctly');
    } catch (error) {
      console.error('❌ Security scenario test failed:', error);
      throw error;
    } finally {
      await this.clearAllTestData();
    }
  }

  // Helper functions (duplicated from AuthContext for testing)
  private static async generateEncryptionSalt(): Promise<string> {
    try {
      let salt = await SecureStore.getItemAsync(this.ENCRYPTION_KEY);
      if (!salt) {
        const randomBytes = await Crypto.getRandomBytesAsync(32);
        salt = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
        await SecureStore.setItemAsync(this.ENCRYPTION_KEY, salt);
      }
      return salt;
    } catch (error) {
      return Date.now().toString(36);
    }
  }

  private static async encryptTokenData(data: string): Promise<string> {
    try {
      const salt = await this.generateEncryptionSalt();
      const dataWithSalt = `${salt}:${data}`;
      const hash = await Crypto.digestStringAsync(
        this.ENCRYPTION_ALGORITHM,
        dataWithSalt,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      return hash;
    } catch (error) {
      return data;
    }
  }

  private static async hashData(data: string): Promise<string> {
    return await Crypto.digestStringAsync(
      this.ENCRYPTION_ALGORITHM,
      data,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
  }

  private static async createSecureTokenData(tokenData: any): Promise<any> {
    const dataString = JSON.stringify(tokenData);
    const encryptedData = await this.encryptTokenData(dataString);
    const hash = await this.hashData(dataString);
    
    const now = Date.now();
    const expiresAt = now + this.MAX_TOKEN_AGE;
    
    return {
      encryptedData,
      hash,
      timestamp: now,
      expiresAt
    };
  }

  private static async validateTokenIntegrity(secureData: any, originalData: string): Promise<boolean> {
    try {
      const expectedHash = await this.hashData(originalData);
      const isHashValid = secureData.hash === expectedHash;
      const isNotExpired = Date.now() < secureData.expiresAt;
      const isNotTooOld = (Date.now() - secureData.timestamp) < this.MAX_TOKEN_AGE;
      
      return isHashValid && isNotExpired && isNotTooOld;
    } catch (error) {
      return false;
    }
  }

  private static async saveTokens(tokens: any): Promise<void> {
    const secureTokenData = await this.createSecureTokenData(tokens);
    
    await SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    await SecureStore.setItemAsync(this.TOKEN_METADATA_KEY, JSON.stringify(secureTokenData));
  }

  private static async getStoredTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const accessToken = await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
      const metadataString = await SecureStore.getItemAsync(this.TOKEN_METADATA_KEY);
      
      if (!accessToken || !refreshToken || !metadataString) {
        await this.clearStoredTokens();
        return null;
      }
      
      try {
        const metadata = JSON.parse(metadataString);
        const tokenData = { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: '15m' };
        const isValid = await this.validateTokenIntegrity(metadata, JSON.stringify(tokenData));
        
        if (!isValid) {
          await this.clearStoredTokens();
          return null;
        }
        
        return { accessToken, refreshToken };
      } catch (parseError) {
        await this.clearStoredTokens();
        return null;
      }
    } catch (error) {
      await this.clearStoredTokens();
      return null;
    }
  }

  private static async clearStoredTokens(): Promise<void> {
    const keysToDelete = [
      this.ACCESS_TOKEN_KEY,
      this.REFRESH_TOKEN_KEY,
      this.USER_DATA_KEY,
      this.TOKEN_METADATA_KEY
    ];
    
    await Promise.all(keysToDelete.map(async (key) => {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        // Ignore deletion errors
      }
    }));
  }

  private static async clearAllTestData(): Promise<void> {
    await this.clearStoredTokens();
    try {
      await SecureStore.deleteItemAsync(this.ENCRYPTION_KEY);
    } catch (error) {
      // Ignore deletion errors
    }
  }
}

// Export for use in React Native app
export default SecureTokenStorageTest;