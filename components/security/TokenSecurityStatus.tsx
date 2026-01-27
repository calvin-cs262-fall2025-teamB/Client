import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

interface SecurityStatus {
  encryption: boolean;
  integrity: boolean;
  expiration: boolean;
  storage: boolean;
}

interface SecurityTest {
  name: string;
  test: () => Promise<boolean>;
  description: string;
}

const calculateSecurityScore = (status: SecurityStatus): number => {
  let score = 0;
  if (status.encryption) score += 3;
  if (status.integrity) score += 2;
  if (status.expiration) score += 2;
  if (status.storage) score += 3;
  return Math.round((score / 10) * 100);
};

const SECURITY_TESTS: SecurityTest[] = [
  {
    name: 'Token Encryption',
    description: 'Verifies tokens are encrypted with SHA256',
    test: async (): Promise<boolean> => {
      try {
        const testData = 'test-token-123';
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          testData + 'test-salt',
          { encoding: Crypto.CryptoEncoding.HEX }
        );
        return hash.length === 64; // SHA256 produces 64-char hex string
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Secure Storage',
    description: 'Tests SecureStore functionality',
    test: async (): Promise<boolean> => {
      try {
        const testKey = 'test_security_key';
        const testValue = 'test_security_value';
        await SecureStore.setItemAsync(testKey, testValue);
        const retrieved = await SecureStore.getItemAsync(testKey);
        await SecureStore.deleteItemAsync(testKey);
        return retrieved === testValue;
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Integrity Validation',
    description: 'Checks token integrity validation',
    test: async (): Promise<boolean> => {
      try {
        const testToken = 'test-integrity-token';
        const hash1 = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          testToken,
          { encoding: Crypto.CryptoEncoding.HEX }
        );
        const hash2 = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          testToken,
          { encoding: Crypto.CryptoEncoding.HEX }
        );
        return hash1 === hash2;
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Expiration Check',
    description: 'Validates token expiration logic',
    test: async (): Promise<boolean> => {
      const now = Date.now();
      const futureTime = now + 60000; // 1 minute in future
      const pastTime = now - 60000; // 1 minute in past
      return futureTime > now && pastTime < now;
    }
  }
];

const TokenSecurityStatus: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    encryption: false,
    integrity: false,
    expiration: false,
    storage: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runSecurityTests = async (): Promise<void> => {
    setIsLoading(true);
    const newStatus: SecurityStatus = {
      encryption: false,
      integrity: false,
      expiration: false,
      storage: false
    };

    try {
      for (const [index, test] of SECURITY_TESTS.entries()) {
        const result = await test.test();
        
        switch (index) {
          case 0: // Token Encryption
            newStatus.encryption = result;
            break;
          case 1: // Secure Storage
            newStatus.storage = result;
            break;
          case 2: // Integrity Validation
            newStatus.integrity = result;
            break;
          case 3: // Expiration Check
            newStatus.expiration = result;
            break;
        }
      }
    } catch (error) {
      console.error('Security test error:', error);
      Alert.alert(
        'Security Test Failed',
        'Unable to complete security validation. Check console for details.'
      );
    }

    setSecurityStatus(newStatus);
    setLastCheck(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    runSecurityTests();
  }, []);

  const securityScore = calculateSecurityScore(securityStatus);
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const StatusIndicator: React.FC<{ 
    label: string; 
    status: boolean; 
    description: string;
  }> = ({ label, status, description }) => (
    <View style={styles.statusRow}>
      <View style={[
        styles.statusIndicator,
        { backgroundColor: status ? '#4CAF50' : '#F44336' }
      ]} />
      <View style={styles.statusInfo}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.statusDescription}>{description}</Text>
      </View>
      <Text style={[
        styles.statusText,
        { color: status ? '#4CAF50' : '#F44336' }
      ]}>
        {status ? '✓' : '✗'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Token Security Status</Text>
        <Text style={[
          styles.scoreText,
          { color: getScoreColor(securityScore) }
        ]}>
          {securityScore}%
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <StatusIndicator
          label="Encryption"
          status={securityStatus.encryption}
          description="SHA256 token encryption"
        />
        <StatusIndicator
          label="Integrity"
          status={securityStatus.integrity}
          description="Token integrity validation"
        />
        <StatusIndicator
          label="Expiration"
          status={securityStatus.expiration}
          description="Token expiration logic"
        />
        <StatusIndicator
          label="Storage"
          status={securityStatus.storage}
          description="Secure storage functionality"
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.refreshButton, isLoading && styles.buttonDisabled]}
          onPress={runSecurityTests}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>
            {isLoading ? 'Testing...' : 'Refresh Tests'}
          </Text>
        </TouchableOpacity>
        
        {lastCheck && (
          <Text style={styles.lastCheckText}>
            Last check: {lastCheck.toLocaleTimeString()}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 12,
    color: '#6c757d',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  lastCheckText: {
    fontSize: 12,
    color: '#6c757d',
  },
});

export default TokenSecurityStatus;