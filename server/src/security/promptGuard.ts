/**
 * Security: Prompt Injection Guard & AI Safety Boundary Enforcement
 * Ensures BreatheSmart AI maintains ethical boundaries, prevents jailbreaks,
 * and handles medical diagnostic queries with clinical triage referrals.
 */

export interface SecurityCheckResult {
  isSafe: boolean;
  category: 'clean' | 'prompt_injection' | 'medical_emergency' | 'unrelated';
  safeResponse?: string;
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+(instructions|directives|prompts|rules)/i,
  /reveal\s+(your\s+)?(system\s+prompt|secret|api\s*key)/i,
  /you\s+are\s+now\s+(in\s+)?(dan|developer\s+mode|unrestricted)/i,
  /act\s+as\s+(an\s+)?(unfiltered|jailbroken|evil)/i,
  /bypass\s+(all\s+)?(content\s+filters|safety\s+checks|rules)/i,
  /disregard\s+(the\s+above|system\s+rules|all\s+instructions)/i
];

const MEDICAL_EMERGENCY_PATTERNS = [
  /(can't|cannot)\s+breathe/i,
  /severe\s+(chest\s+pain|shortness\s+of\s+breath)/i,
  /having\s+an\s+asthma\s+attack/i,
  /what\s+dose\s+of\s+(inhaler|albuterol|steroid|prednisone)/i,
  /lips\s+(turning\s+)?blue/i,
  /diagnose\s+my\s+(cough|respiratory|lung\s+disease)/i
];

const AIR_POLLUTION_KEYWORDS = [
  'air', 'smog', 'aqi', 'pm2.5', 'pm10', 'pollution', 'filter', 'inversion', 
  'purifier', 'corsi', 'hepa', 'smoke', 'mask', 'n95', 'kf94', 'breathe', 
  'asthma', 'lung', 'window', 'ventilation', 'heating', 'chulha', 'biomass', 
  'commute', 'indoor', 'clean', 'co2', 'weather', 'child', 'elderly'
];

export function inspectPromptSecurity(prompt: string): SecurityCheckResult {
  const normalized = prompt.trim();

  // 1. Check for prompt injection / jailbreak attempts
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        category: 'prompt_injection',
        safeResponse: `🛡️ **Security Alert: Safety Protocol Engaged**\n\nI am **BreatheSmart AI**, dedicated exclusively to helping families and communities navigate severe winter smog and urban air pollution.\n\nI operate strictly within scientific environmental health boundaries and cannot override system directives or reveal internal credentials. How can I assist your family with clean air or low-emission routines today?`
      };
    }
  }

  // 2. Check for acute medical emergencies / prescription requests
  for (const pattern of MEDICAL_EMERGENCY_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        category: 'medical_emergency',
        safeResponse: `🚨 **URGENT MEDICAL NOTICE: Seek Immediate Care**\n\nIf you or someone in your household is experiencing **severe shortness of breath, inability to speak in full sentences, or blue lips/fingernails**, please **call emergency medical services (such as 911 / 112 / 102) immediately** or proceed to the nearest emergency room.\n\n*Clinical Boundary Disclaimer:* BreatheSmart AI is an environmental exposure and routine assistant, not a licensed medical practitioner. We cannot diagnose conditions or prescribe medication dosages. Please administer rescue inhalers strictly as prescribed in your personal Asthma Action Plan while keeping indoor air filtered.`
      };
    }
  }

  // 3. Check for completely unrelated topic drift
  const words = normalized.toLowerCase().split(/\W+/);
  const hasSmogContext = words.some(w => AIR_POLLUTION_KEYWORDS.includes(w));
  
  if (!hasSmogContext && words.length > 5) {
    return {
      isSafe: true,
      category: 'unrelated',
      safeResponse: `🌿 **BreatheSmart AI Scope Advisory**\n\nI am specialized in **severe winter smog, urban air quality, low-emission daily routines, and indoor air hacks**.\n\nWhile I see your question touches on other topics, I am most effective when helping you reduce toxic particulate inhalation, assemble affordable DIY purifiers, or plan smog-resilient family schedules. Try asking: *"How do I protect my family during morning smog peaks?"*`
    };
  }

  return { isSafe: true, category: 'clean' };
}
