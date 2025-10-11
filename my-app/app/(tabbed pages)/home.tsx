
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { useQuery } from '@tanstack/react-query'; // TODO: Install later
// import { base44 } from '@/api/base44Client'; // TODO: Set up API client

// MOCK DATA - Replace with real API calls later
const MOCK_ADVENTURES = [
  {
    id: '1',
    title: 'Campus History Tour',
    summary: 'Discover the rich history of Calvin University through iconic landmarks',
    image_url: null,
    region: {
      id: '1',
      name: 'North Campus',
      center: { lat: 42.9301, lng: -85.5883 }
    },
    tokenCount: 5,
    status: 'published'
  },
  {
    id: '2',
    title: 'Hidden Art Walk',
    summary: 'Find secret art installations scattered across campus',
    image_url: null,
    region: {
      id: '2',
      name: 'South Campus',
      center: { lat: 42.9290, lng: -85.5870 }
    },
    tokenCount: 8,
    status: 'published'
  },
  {
    id: '3',
    title: 'Science Building Quest',
    summary: 'Explore the wonders of our science facilities',
    image_url: null,
    region: {
      id: '1',
      name: 'North Campus',
      center: { lat: 42.9301, lng: -85.5883 }
    },
    tokenCount: 6,
    status: 'published'
  }
];

export default function HomePage() {
  const router = useRouter();
  const [selectedAdventure, setSelectedAdventure] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TODO: Replace with real API call when backend is ready
  // const { data: adventures = [], isLoading } = useQuery({
  //   queryKey: ['adventures'],
  //   queryFn: async () => {
  //     const advs = await base44.entities.Adventure.filter({ status: 'published' });
  //     const regions = await base44.entities.Region.list();
  //     return advs.map(adv => {
  //       const region = regions.find(r => r.id === adv.region_id);
  //       return { ...adv, region, tokenCount: adv.token_steps?.length || 0 };
  //     });
  //   }
  // });

  const adventures = MOCK_ADVENTURES;
  const isLoading = false;

  const filteredAdventures = adventures.filter(adv =>
    adv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    adv.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdventurePress = (adventure) => {
    setSelectedAdventure(adventure);
    setIsModalOpen(true);
  };

  const handleStartAdventure = () => {
    // TODO: Navigate to adventure play page when created
    // router.push(`/adventurePlay?id=${selectedAdventure.id}`);
    setIsModalOpen(false);
    alert('Adventure play page coming soon!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>WayFind</Text>
        <Text style={styles.subtitle}>Discover campus adventures</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search adventures..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Adventure Cards */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          // Loading skeleton
          <>
            <View style={[styles.card, styles.skeleton]} />
            <View style={[styles.card, styles.skeleton]} />
            <View style={[styles.card, styles.skeleton]} />
          </>
        ) : filteredAdventures.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No adventures found</Text>
            <Text style={styles.emptySubtext}>Check back soon for new adventures!</Text>
          </View>
        ) : (
          filteredAdventures.map(adventure => (
            <TouchableOpacity
              key={adventure.id}
              style={styles.card}
              onPress={() => handleAdventurePress(adventure)}
            >
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardImageText}>🗺️</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{adventure.title}</Text>
                <Text style={styles.cardSummary} numberOfLines={2}>
                  {adventure.summary}
                </Text>
                <View style={styles.cardFooter}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      📍 {adventure.region.name}
                    </Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      🪙 {adventure.tokenCount} tokens
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Simple Modal */}
      {isModalOpen && selectedAdventure && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{selectedAdventure.title}</Text>
            <Text style={styles.modalText}>{selectedAdventure.summary}</Text>
            <Text style={styles.modalInfo}>
              Region: {selectedAdventure.region.name}
            </Text>
            <Text style={styles.modalInfo}>
              Tokens to collect: {selectedAdventure.tokenCount}
            </Text>
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartAdventure}
            >
              <Text style={styles.startButtonText}>Start Adventure</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalOpen(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeleton: {
    height: 280,
    backgroundColor: '#E5E7EB',
  },
  cardImagePlaceholder: {
    height: 160,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageText: {
    fontSize: 48,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardSummary: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#4B5563',
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  modalInfo: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});





