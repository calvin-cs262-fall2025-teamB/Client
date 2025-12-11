import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";

export default function HelpScreen() {
  const router = useRouter();

  const handleReportBug = () => {
    // Replace with your actual support email
    Linking.openURL("mailto:support@wayfindgame.com?subject=Bug Report");
  };

  const handleFeedback = () => {
    // Replace with your actual feedback email
    Linking.openURL("mailto:support@wayfindgame.com?subject=Feedback");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
      </View>

      {/* How to Play Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 How to Play</Text>
        <View style={styles.card}>
          <Text style={styles.stepNumber}>1.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Find Adventures</Text>
            <Text style={styles.stepText}>
              Browse the Home tab to discover adventures near you
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.stepNumber}>2.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Start Exploring</Text>
            <Text style={styles.stepText}>
              Tap an adventure and hit Play to begin your quest
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.stepNumber}>3.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Collect Tokens</Text>
            <Text style={styles.stepText}>
              Walk close to token locations to collect them. You'll feel a vibration when you're near!
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.stepNumber}>4.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Complete Adventures</Text>
            <Text style={styles.stepText}>
              Collect all tokens to complete the adventure and earn bragging rights!
            </Text>
          </View>
        </View>
      </View>

      {/* Creating Adventures Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗺️ Creating Adventures</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            <Text style={styles.bold}>Create a Region:</Text> Tap the Creator tab, choose "Create Region",
            name it, then tap the map to place the center point.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>
            <Text style={styles.bold}>Adjust Size:</Text> Use two fingers to pinch and resize your region.
            Tap again to reposition the center.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>
            <Text style={styles.bold}>Build Adventures:</Text> Once you have a region, create adventures
            within it and place tokens for others to find!
          </Text>
        </View>
      </View>

      {/* Tips & Tricks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Tips & Tricks</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            • Make sure location permissions are enabled for the best experience
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            • Your phone will vibrate when you're close to a token
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            • Check your Profile to see all completed adventures
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            • Create regions in familiar areas so others can explore your neighborhood!
          </Text>
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❓ FAQ</Text>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>
            What's the difference between regions and adventures?
          </Text>
          <Text style={styles.faqAnswer}>
            Regions are geographic areas you create. Adventures are quests within those regions that contain tokens to collect.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>
            How close do I need to be to collect a token?
          </Text>
          <Text style={styles.faqAnswer}>
            You need to be within about 20-30 meters of a token. Your phone will vibrate when you're in range!
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>
            Can I delete my adventures or regions?
          </Text>
          <Text style={styles.faqAnswer}>
            Currently, deletion features are being added in a future update. Contact support if you need help.
          </Text>
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛟 Need More Help?</Text>

        <TouchableOpacity style={styles.supportButton} onPress={handleReportBug}>
          <Text style={styles.supportButtonText}>🐛 Report a Bug</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportButton} onPress={handleFeedback}>
          <Text style={styles.supportButtonText}>💬 Send Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ About</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>WayFind</Text>
          <Text style={styles.aboutSubtext}>Version 1.0.0</Text>
          <Text style={styles.aboutSubtext}>
            A location-based adventure game
          </Text>
          <Text style={styles.creditText}>
            Made with ❤️ by Team B
          </Text>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginRight: 12,
    width: 30,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  cardText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    flex: 1,
  },
  bold: {
    fontWeight: "700",
    color: "#1F2937",
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  supportButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  aboutText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  aboutSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 2,
  },
  creditText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  bottomPadding: {
    height: 40,
  },
});
