/**
 * AI Provider Abstraction (Rule-Based Fallback initially)
 * Phase 3: Voice-First Intelligent Matching
 */

const KEYWORD_MAP = {
  plumber: ['nal', 'pipe', 'leak', 'tap', 'plumber', 'water', 'pani', 'tanki'],
  electrician: ['fan', 'switch', 'light', 'wiring', 'bijli', 'electrician', 'current', 'bulb'],
  carpenter: ['door', 'wood', 'furniture', 'bed', 'chair', 'table', 'lakdi', 'carpenter'],
  ac_repair: ['ac', 'cooling', 'thanda', 'air conditioner', 'compressor'],
  cleaning: ['safai', 'cleaning', 'clean', 'kachra', 'dusting'],
  appliance_repair: ['fridge', 'washing machine', 'tv', 'repair', 'machine']
};

const URGENCY_MAP = {
  emergency: ['emergency', 'abh', 'abhi', 'immediately', 'jaldi', 'urgent', 'leak', 'fire', 'current'],
  urgent: ['aaj', 'today', 'fast'],
  normal: ['kal', 'tomorrow', 'subah', 'shaam', 'weekend', 'aram se', 'later']
};

class RuleBasedFallbackProvider {
  /**
   * Understand natural language and return structured intent
   * @param {string} text - User's spoken/typed text
   * @returns {Object} Structured Intent
   */
  async understandIntent(text) {
    const lowerText = text.toLowerCase();
    
    // 1. Identify Service Category
    let detectedService = null;
    let serviceConfidence = 0;
    
    for (const [service, keywords] of Object.entries(KEYWORD_MAP)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          detectedService = service.toUpperCase();
          serviceConfidence += 0.4; // rough heuristic
        }
      }
    }

    if (serviceConfidence > 0.9) serviceConfidence = 0.9; // Max cap for rule-based

    // 2. Identify Urgency
    let detectedUrgency = 'NORMAL';
    for (const [urgency, keywords] of Object.entries(URGENCY_MAP)) {
      if (keywords.some(k => lowerText.includes(k))) {
        detectedUrgency = urgency.toUpperCase();
        break; // take highest priority if matched in order of map (needs fixing order if so, but emergency is first)
      }
    }

    // 3. Problem Description is the raw text
    const problemDescription = text;

    return {
      serviceCategory: detectedService,
      problemDescription,
      urgency: detectedUrgency,
      preferredTime: null, // Basic regex for time can be added later
      locationIntent: null, // Basic regex for location can be added
      confidence: detectedService ? serviceConfidence : 0.1
    };
  }
}

// Export the selected AI Provider
// Can swap with OpenAIProvider when API keys are available
const aiProvider = new RuleBasedFallbackProvider();

module.exports = {
  aiProvider
};
