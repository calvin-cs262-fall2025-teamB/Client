import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { helpContent } from './helpContent';

interface HelpModalProps {
  pageId: keyof typeof helpContent;
  iconStyle?: object;
  iconSize?: number;
  iconColor?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const HelpModal: React.FC<HelpModalProps> = ({
  pageId,
  iconStyle = {},
  iconSize = 24,
  iconColor = '#007AFF',
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const content = helpContent[pageId];

  const getPositionStyle = () => {
    const baseStyle = { position: 'absolute' as const, zIndex: 1000 };
    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: 60, left: 20 };
      case 'top-right':
        return { ...baseStyle, top: 60, right: 20 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 40, left: 20 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 40, right: 20 };
      default:
        return { ...baseStyle, top: 60, right: 20 };
    }
  };

  if (!content) {
    console.warn(`No help content found for page: ${pageId}`);
    return null;
  }

  return (
    <>
      {/* Help Icon */}
      <TouchableOpacity
        style={[styles.helpIcon, getPositionStyle(), iconStyle]}
        onPress={() => setIsVisible(true)}
      >
        <Ionicons 
          name="help-circle" 
          size={iconSize} 
          color={iconColor} 
        />
      </TouchableOpacity>

      {/* Help Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{content.title}</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {content.sections.map((section, index) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.sectionHeading}>{section.heading}</Text>
                  <Text style={styles.sectionContent}>{section.content}</Text>
                  {section.tips && (
                    <View style={styles.tipsContainer}>
                      {section.tips.map((tip, tipIndex) => (
                        <Text key={tipIndex} style={styles.tip}>
                          • {tip}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  helpIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  tipsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  tip: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
});