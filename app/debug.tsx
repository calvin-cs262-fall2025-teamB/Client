import themes from '@/assets/utils/themes';
import { DatabaseSync } from '@/components/reusable/DatabaseSync';
import { localDb } from '@/data/localDatabaseService';
import {
  mockAdventurers,
  mockAdventures,
  mockCompletedAdventures,
  mockLandmarks,
  mockRegions,
  mockTokens
} from '@/data/mockData';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';

export default function DebugPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    // Data
    adventurers,
    regions,
    landmarks,
    adventures,
    tokens,
    completedAdventures,
    
    // Loading states
    loading,
    errors,
    
    // Fetch functions
    fetchAdventurers,
    fetchRegions,
    fetchLandmarks,
    fetchAdventures,
    fetchTokens,
    fetchCompletedAdventures,

    // Create/Update functions
    createRegion,
    createLandmark,
    createAdventure,
    createToken,
    completeAdventure,
    createAdventurer,
    updateAdventurer,
  } = useDatabase();

  interface TestResult {
    id: number;
    test: string;
    success: boolean;
    data: any;
    error: string | null;
    timestamp: string;
  }

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Test input states
  const [testRegion, setTestRegion] = useState({
    name: 'Debug Test Region',
    description: 'A test region created from debug page',
    location: { x: 42.9634, y: -85.6681 },
    radius: 500,
  });

  const [testAdventure, setTestAdventure] = useState({
    name: 'Debug Test Adventure',
    numtokens: 3,
    regionid: 1,
    location: { x: 42.9634, y: -85.6681 },
  });

  const [testAdventurer, setTestAdventurer] = useState({
    username: 'DebugTestUser',
    password: 'testpassword123',
    profilepicture: null,
  });

  const [testLandmark, setTestLandmark] = useState({
    name: 'Debug Test Landmark',
    regionid: 1,
    location: { x: 42.9634, y: -85.6681 },
  });

  const [testCompletedAdventure, setTestCompletedAdventure] = useState({
    adventureid: 1,
    completiondate: new Date().toISOString().split('T')[0],
    completiontime: '00:30:00',
  });

  // Input states for parameterized tests
  const [regionIdInput, setRegionIdInput] = useState<string>('1');
  const [adventureIdInput, setAdventureIdInput] = useState<string>('1');

  const addTestResult = (test: string, success: boolean, data: any = null, error: string | null = null) => {
    const result = {
      id: Date.now() + Math.random(), // Make ID unique to prevent duplicate keys
      test,
      success,
      data,
      error,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTestResults(prev => [result, ...prev]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Individual test functions
  const testFetchAdventurers = async () => {
    try {
      await fetchAdventurers();
      addTestResult('Fetch Adventurers', true, adventurers);
    } catch (error) {
      addTestResult('Fetch Adventurers', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testFetchRegions = async () => {
    try {
      await fetchRegions();
      addTestResult('Fetch Regions', true, regions);
    } catch (error) {
      addTestResult('Fetch Regions', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testFetchAdventures = async () => {
    try {
      await fetchAdventures();
      addTestResult('Fetch Adventures', true, adventures);
    } catch (error) {
      addTestResult('Fetch Adventures', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testFetchLandmarks = async () => {
    try {
      const regionId = regionIdInput ? parseInt(regionIdInput) : null;
      await fetchLandmarks(regionId);
      addTestResult(`Fetch Landmarks${regionId ? ` for Region ${regionId}` : ''}`, true, landmarks);
    } catch (error) {
      addTestResult('Fetch Landmarks', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testFetchTokens = async () => {
    try {
      const adventureId = adventureIdInput ? parseInt(adventureIdInput) : null;
      await fetchTokens(adventureId);
      addTestResult(`Fetch Tokens${adventureId ? ` for Adventure ${adventureId}` : ''}`, true, tokens);
    } catch (error) {
      addTestResult('Fetch Tokens', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testFetchCompletedAdventures = async () => {
    if (user?.id) {
      try {
        await fetchCompletedAdventures(user.id);
        addTestResult('Fetch Completed Adventures', true, completedAdventures);
      } catch (error) {
        addTestResult('Fetch Completed Adventures', false, null, error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      addTestResult('Fetch Completed Adventures', false, null, 'No user logged in');
    }
  };

  const testCreateRegion = async () => {
    try {
      const result = await createRegion({
        ...testRegion,
        adventurerid: user?.id || 1,
      });
      addTestResult('Create Region', true, result);
    } catch (error) {
      addTestResult('Create Region', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testCreateLandmark = async () => {
    try {
      const result = await createLandmark({
        ...testLandmark,
        regionid: regions && regions.length > 0 ? regions[0].id : 1,
      });
      addTestResult('Create Landmark', true, result);
    } catch (error) {
      addTestResult('Create Landmark', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testCreateAdventure = async () => {
    try {
      const result = await createAdventure({
        ...testAdventure,
        adventurerid: user?.id || 1,
      });
      addTestResult('Create Adventure', true, result);
    } catch (error) {
      addTestResult('Create Adventure', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testCreateToken = async () => {
    if (adventures && adventures.length > 0) {
      try {
        const result = await createToken({
          adventureid: adventures[0].id,
          location: { x: 42.9634, y: -85.6681 },
          hint: 'Debug test token hint',
          tokenorder: 1,
        });
        addTestResult('Create Token', true, result);
      } catch (error) {
        addTestResult('Create Token', false, null, error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      addTestResult('Create Token', false, null, 'No adventures available');
    }
  };

  const testCreateAdventurer = async () => {
    try {
      const result = await createAdventurer({
        ...testAdventurer,
        username: `${testAdventurer.username}_${Date.now()}`, // Make unique to avoid conflicts
      });
      addTestResult('Create Adventurer', true, result);
    } catch (error) {
      addTestResult('Create Adventurer', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testCreateCompletedAdventure = async () => {
    if (adventures && adventures.length > 0) {
      try {
        const result = await completeAdventure({
          ...testCompletedAdventure,
          adventurerid: user?.id || 1,
          adventureid: adventures[0].id,
        });
        addTestResult('Create Completed Adventure', true, result);
      } catch (error) {
        addTestResult('Create Completed Adventure', false, null, error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      addTestResult('Create Completed Adventure', false, null, 'No adventures available');
    }
  };

  const debugSQLiteDatabase = async () => {
    try {
      console.log('🔍 Starting SQLite database debugging...');
      
      // Check if data is available
      const hasData = await localDb.isDataAvailable();
      addTestResult('SQLite Has Data Check', hasData, { hasData });
      
      // Try to get adventurers directly
      const adventurers = await localDb.getAdventurers();
      addTestResult('SQLite Direct Adventurer Query', true, { 
        count: adventurers.length, 
        sample: adventurers[0] || null 
      });
      
      // Get all table counts
      const regions = await localDb.getRegions();
      const landmarks = await localDb.getLandmarks();
      const adventures = await localDb.getAdventures();
      const tokens = await localDb.getTokens();
      
      addTestResult('SQLite All Table Counts', true, {
        adventurers: adventurers.length,
        regions: regions.length,
        landmarks: landmarks.length,
        adventures: adventures.length,
        tokens: tokens.length
      });
      
    } catch (error) {
      addTestResult('SQLite Database Debug', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const remakeLocalDatabase = async () => {
    try {
      addTestResult('Remake Local Database', true, null, 'Starting database recreation...');
      
      // Initialize local database if needed
      await localDb.initialize();
      
      // Sync mock data to local database
      await localDb.syncDataFromRemote({
        adventurers: mockAdventurers,
        regions: mockRegions,
        landmarks: mockLandmarks,
        adventures: mockAdventures,
        tokens: mockTokens,
        completedAdventures: mockCompletedAdventures
      });
      
      addTestResult('Remake Local Database', true, {
        adventurers: mockAdventurers.length,
        regions: mockRegions.length,
        landmarks: mockLandmarks.length,
        adventures: mockAdventures.length,
        tokens: mockTokens.length,
        completedAdventures: mockCompletedAdventures.length
      }, 'Local database recreated with mock data successfully');
      
      // Refresh data in the context
      await Promise.all([
        fetchRegions(),
        fetchAdventures(),
        fetchCompletedAdventures(user?.id || 1)
      ]);
      
    } catch (error) {
      addTestResult('Remake Local Database', false, null, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    clearResults();
    
    const tests = [
      testFetchAdventurers,
      testFetchRegions,
      testFetchLandmarks,
      testFetchAdventures,
      testFetchTokens,
      testFetchCompletedAdventures,
      // Note: Skipping create tests in "run all" to avoid creating duplicate data
    ];

    for (const test of tests) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
      await test();
    }
    
    setIsRunningTests(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Database Debug Console</Text>
        <Text style={styles.subtitle}>Test DatabaseContext API calls</Text>
        
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User</Text>
        <Text style={styles.infoText}>
          {user ? `Logged in as: ${user.username} (ID: ${user.id})` : 'Not logged in'}
        </Text>
      </View>

      {/* Database Sync Status */}
      <DatabaseSync />
      {/* Database Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database Status</Text>
        <Text style={styles.infoText}>Adventurers: {adventurers?.length || 0}</Text>
        <Text style={styles.infoText}>Regions: {regions?.length || 0}</Text>
        <Text style={styles.infoText}>Landmarks: {landmarks?.length || 0}</Text>
        <Text style={styles.infoText}>Adventures: {adventures?.length || 0}</Text>
        <Text style={styles.infoText}>Tokens: {tokens?.length || 0}</Text>
        <Text style={styles.infoText}>Completed Adventures: {completedAdventures?.length || 0}</Text>
        
        {/* Sample Data Preview */}
        {adventures && adventures.length > 0 && (
          <View style={styles.dataPreviewContainer}>
            <Text style={styles.dataPreviewTitle}>Sample Adventure:</Text>
            <Text style={styles.dataPreviewText}>
              ID: {adventures[0].id}, Name: {adventures[0].name || 'N/A'}
            </Text>
          </View>
        )}
      </View>

      {/* Loading States */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loading States</Text>
        <Text style={styles.infoText}>Adventurers: {loading.adventurers ? 'Loading...' : 'Ready'}</Text>
        <Text style={styles.infoText}>Regions: {loading.regions ? 'Loading...' : 'Ready'}</Text>
        <Text style={styles.infoText}>Landmarks: {loading.landmarks ? 'Loading...' : 'Ready'}</Text>
        <Text style={styles.infoText}>Adventures: {loading.adventures ? 'Loading...' : 'Ready'}</Text>
        <Text style={styles.infoText}>Tokens: {loading.tokens ? 'Loading...' : 'Ready'}</Text>
        <Text style={styles.infoText}>Completed Adventures: {loading.completedAdventures ? 'Loading...' : 'Ready'}</Text>
      </View>

      {/* Error States */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Error States</Text>
        <Text style={[styles.infoText, errors.adventurers && styles.errorText]}>
          Adventurers: {errors.adventurers || 'No errors'}
        </Text>
        <Text style={[styles.infoText, errors.regions && styles.errorText]}>
          Regions: {errors.regions || 'No errors'}
        </Text>
        <Text style={[styles.infoText, errors.landmarks && styles.errorText]}>
          Landmarks: {errors.landmarks || 'No errors'}
        </Text>
        <Text style={[styles.infoText, errors.adventures && styles.errorText]}>
          Adventures: {errors.adventures || 'No errors'}
        </Text>
        <Text style={[styles.infoText, errors.tokens && styles.errorText]}>
          Tokens: {errors.tokens || 'No errors'}
        </Text>
        <Text style={[styles.infoText, errors.completedAdventures && styles.errorText]}>
          Completed Adventures: {errors.completedAdventures || 'No errors'}
        </Text>
      </View>

      {/* Test Inputs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Parameters</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Region ID (for landmarks):</Text>
          <TextInput
            style={styles.numberInput}
            value={regionIdInput}
            onChangeText={setRegionIdInput}
            placeholder="Enter region ID"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Adventure ID (for tokens):</Text>
          <TextInput
            style={styles.numberInput}
            value={adventureIdInput}
            onChangeText={setAdventureIdInput}
            placeholder="Enter adventure ID"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Test Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Controls</Text>
        
        <TouchableOpacity 
          style={[styles.testButton, styles.primaryButton]} 
          onPress={runAllTests}
          disabled={isRunningTests}
        >
          <Text style={styles.testButtonText}>
            {isRunningTests ? 'Running Tests...' : 'Run All Read Tests'}
          </Text>
          {isRunningTests && <ActivityIndicator size="small" color="white" style={styles.loader} />}
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.testButton} onPress={testFetchAdventurers}>
            <Text style={styles.testButtonText}>Read Adventurers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.testButton} onPress={testFetchRegions}>
            <Text style={styles.testButtonText}>Read Regions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.testButton} onPress={testFetchLandmarks}>
            <Text style={styles.testButtonText}>Read Landmarks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.testButton} onPress={testFetchAdventures}>
            <Text style={styles.testButtonText}>Read Adventures</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.testButton} onPress={testFetchTokens}>
            <Text style={styles.testButtonText}>Read Tokens</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={testFetchCompletedAdventures}>
            <Text style={styles.testButtonText}>Read Completed Adventures</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Create Tests (Use Carefully)</Text>
        <Text style={styles.warningText}>These tests will create real data in the database</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.testButton, styles.createButton]} onPress={testCreateRegion}>
            <Text style={styles.testButtonText}>Create Region</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.testButton, styles.createButton]} onPress={testCreateLandmark}>
            <Text style={styles.testButtonText}>Create Landmark</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.testButton, styles.createButton]} onPress={testCreateAdventure}>
            <Text style={styles.testButtonText}>Create Adventure</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.testButton, styles.createButton]} onPress={testCreateToken}>
            <Text style={styles.testButtonText}>Create Token</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.testButton, styles.createButton]} onPress={testCreateAdventurer}>
            <Text style={styles.testButtonText}>Create Adventurer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.testButton, styles.createButton]} onPress={testCreateCompletedAdventure}>
            <Text style={styles.testButtonText}>Create Completed Adventure</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Database Management</Text>
        <Text style={styles.warningText}>⚠️ This will replace all local SQLite data with mock data</Text>
        
        <TouchableOpacity style={[styles.testButton, styles.databaseButton]} onPress={remakeLocalDatabase}>
          <Text style={styles.testButtonText}>🔄 Remake Local Database with Mock Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.testButton, styles.debugButton]} onPress={debugSQLiteDatabase}>
          <Text style={styles.testButtonText}>🔍 Debug SQLite Database</Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Results ({testResults.length})</Text>
        
        {testResults.map((result) => (
          <View 
            key={result.id} 
            style={[
              styles.resultCard, 
              result.success ? styles.successCard : styles.errorCard
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{result.test}</Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
            
            <Text style={[
              styles.resultStatus,
              result.success ? styles.successText : styles.errorText
            ]}>
              {result.success ? '✅ SUCCESS' : '❌ FAILED'}
            </Text>
            
            {result.error && (
              <Text style={styles.errorDetails}>Error: {result.error}</Text>
            )}
            
            {result.data && (
              <ScrollView 
                style={styles.dataScrollContainer} 
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.dataPreview}>
                  Data: {JSON.stringify(result.data, null, 2)}
                </Text>
              </ScrollView>
            )}
          </View>
        ))}
        
        {testResults.length === 0 && (
          <Text style={styles.noResults}>No test results yet. Run some tests!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: themes.primaryColor,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themes.primaryColorDark,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  errorText: {
    color: '#e74c3c',
  },
  successText: {
    color: '#27ae60',
  },
  warningText: {
    fontSize: 12,
    color: '#f39c12',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: themes.primaryColor,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
    flex: 1,
    marginHorizontal: 2,
  },
  primaryButton: {
    backgroundColor: themes.primaryColorDark,
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: '#f39c12',
  },
  databaseButton: {
    backgroundColor: '#9b59b6',
  },
  debugButton: {
    backgroundColor: '#34495e',
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultCard: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  successCard: {
    backgroundColor: '#f8fff8',
    borderLeftColor: '#27ae60',
  },
  errorCard: {
    backgroundColor: '#fff8f8',
    borderLeftColor: '#e74c3c',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultTitle: {
    fontWeight: '600',
    color: themes.primaryColorDark,
  },
  resultTime: {
    fontSize: 12,
    color: '#999',
  },
  resultStatus: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorDetails: {
    fontSize: 12,
    color: '#e74c3c',
    marginBottom: 5,
  },
  dataPreview: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  dataScrollContainer: {
    maxHeight: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    padding: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  dataPreviewContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: themes.primaryColor,
  },
  dataPreviewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: themes.primaryColorDark,
    marginBottom: 4,
  },
  dataPreviewText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 80,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
});