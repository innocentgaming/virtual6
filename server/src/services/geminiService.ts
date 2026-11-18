import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, UserLifestyleProfile, AQIData } from '../types';
import { sanitizeString } from '../utils/sanitizer';
import { inspectPromptSecurity } from '../security/promptGuard';

const SYSTEM_PROMPT = `You are BreatheSmart AI, an empathetic, scientifically grounded GenAI assistant specializing in severe winter smog and urban air pollution navigation for families, students, professionals, and communities.
Your mission:
1. Provide actionable, low-emission daily routines and practical indoor air quality (IAQ) hacks.
2. Clearly explain the direct health and ecological impact of choices (e.g. avoided PM2.5 lung deposition, CO2 emissions prevented).
3. Tailor advice to vulnerable family members (infants, asthmatics, elderly, pregnant women, pets) and local microclimates (thermal inversions, calm winds, cold weather biomass smoke).
4. Emphasize low-cost, accessible interventions (like DIY Corsi-Rosenthal boxes, damp mopping over dry sweeping, strategic micro-ventilation windows).
Keep explanations clear, structured, and compassionate with bulleted action steps. Always cite reliable health principles (WHO Air Quality Guidelines, US EPA AQI benchmarks).`;

const GEMINI_REST_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export async function generateAssistantResponse(
  messages: ChatMessage[],
  profile?: Partial<UserLifestyleProfile>,
  currentAQI?: Partial<AQIData>,
  customApiKey?: string
): Promise<string> {
  const latestUserMessage = messages[messages.length - 1]?.content || '';
  const sanitizedPrompt = sanitizeString(latestUserMessage, 2000);

  // 1. Run security & boundary inspection first
  const securityCheck = inspectPromptSecurity(sanitizedPrompt);
  if (!securityCheck.isSafe && securityCheck.safeResponse) {
    return securityCheck.safeResponse;
  }
  if (securityCheck.category === 'unrelated' && securityCheck.safeResponse) {
    return securityCheck.safeResponse;
  }

  // Determine active API Key (from request header or server .env)
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    let contextString = '';
    if (currentAQI) {
      contextString += `\n[Current Environment: City: ${currentAQI.city || 'Unknown'}, AQI: ${currentAQI.aqi ?? 'N/A'} (${currentAQI.level || 'Unknown'}), PM2.5: ${currentAQI.pollutants?.pm25 ?? 'N/A'} ug/m3, Inversion Risk: ${currentAQI.isInversionLikely ? 'HIGH' : 'LOW'}]`;
    }
    if (profile) {
      contextString += `\n[Household Context: Persona: ${profile.persona || 'Family'}, Budget: ${profile.budgetTier || 'Moderate'}, Vulnerabilities: ${(profile.vulnerabilities || []).join(', ') || 'None reported'}, Commute: ${profile.commuteMode || 'Standard'}, Heating: ${profile.heatingSource || 'Standard'}, Purifier: ${profile.hasAirPurifier ? 'Yes' : 'No'}]`;
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n${contextString}\n\nUser Question: ${sanitizedPrompt}`;

    // 2. Primary Method: Direct REST Call matching Google Gemini generateContent specification
    try {
      const restResponse = await fetch(GEMINI_REST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ]
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (restResponse.ok) {
        const restJson: any = await restResponse.json();
        const candidateText = restJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim().length > 0) {
          return candidateText.trim();
        }
      }
    } catch (restErr) {
      // Fall through to SDK or fallback
    }

    // 3. Secondary Method: Google Generative AI SDK
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (sdkErr) {
      // Fall through to deterministic expert engine
    }
  }

  // 4. Tertiary Resilient Fallback: Built-in Scientific Expert Reasoning Engine
  return getExpertRuleResponse(sanitizedPrompt, profile, currentAQI);
}

export function getExpertRuleResponse(
  prompt: string,
  profile?: Partial<UserLifestyleProfile>,
  currentAQI?: Partial<AQIData>
): string {
  const query = prompt.toLowerCase();
  const city = currentAQI?.city || 'your area';
  const aqiVal = currentAQI?.aqi ?? 285;
  const pm25Val = currentAQI?.pollutants?.pm25 ?? 175;
  const isGoodAQI = aqiVal <= 50;
  const isModerateAQI = aqiVal > 50 && aqiVal <= 100;
  const isSevereAQI = aqiVal > 200;

  // Good AQI scenario handling
  if (isGoodAQI) {
    return `### ☀️ Clean Air Advisory for ${city} (AQI: ${aqiVal} - Good)

Air quality is currently in the **Good** tier (PM2.5: ${pm25Val} µg/m³), well within the WHO guideline target!

#### Recommended Daily Plan:
1. **Full Natural Ventilation**: Open windows for whole-home airing to displace accumulated indoor CO2, radon, and moisture.
2. **Outdoor Activities**: Ideal conditions for outdoor cardio, running, cycling, and children's school play.
3. **Filter Maintenance**: Check pre-filters on your ventilation or purifiers so they are clean and primed before the next winter inversion event.`;
  }

  // Moderate AQI scenario handling
  if (isModerateAQI && !query.includes('diy') && !query.includes('purifier')) {
    return `### 🌤️ Moderate Air Quality Advisory for ${city} (AQI: ${aqiVal} - Moderate)

Air quality is acceptable (PM2.5: ${pm25Val} µg/m³), but sensitive individuals (asthmatics, infants) may experience mild respiratory irritation over prolonged exposure.

#### Recommended Precautions:
1. **Micro-Ventilation**: Vent rooms between **11:00 AM and 2:00 PM** when winds are active.
2. **Sensitive Groups**: Asthmatics should carry their rescue inhaler during outdoor runs.
3. **Clean Commuting**: Consider public transit or carpooling to prevent localized street-canyon NO2 spikes.`;
  }

  // Conflicting preference handling (e.g. user insists on running outside during severe smog)
  if ((query.includes('run outside') || query.includes('outdoor workout') || query.includes('jogging')) && isSevereAQI) {
    return `### ⚠️ Conflicting Activity Advisory: Running in Severe Smog

You asked about running outdoors while ambient AQI in **${city}** is **${aqiVal} (Severe)** with PM2.5 at **${pm25Val} µg/m³**.

#### Scientific Risk:
- When running, minute ventilation jumps from $0.75\\text{ m}^3/\\text{h}$ to **$2.9\\text{ m}^3/\\text{h}$** (a nearly 4x increase in inhaled air volume).
- Heavy mouth-breathing bypasses your nasal filtration hairs, depositing ultra-fine particles deep into pulmonary alveoli and the bloodstream.

#### Healthy Compromise:
1. **Move Indoors**: Complete your aerobic session indoors in a sealed room with an air purifier or Corsi-Rosenthal box on medium/high speed.
2. **Afternoon Shift**: If you must exercise outdoors, wait until **1:00 PM – 2:30 PM** when solar heating temporarily lifts the inversion lid, and wear a well-fitted N95 respirator.`;
  }

  // DIY Purifier / Corsi-Rosenthal Box (Prioritized over generic budget)
  if (query.includes('diy') || query.includes('corsi') || query.includes('build')) {
    return `### 🛠️ DIY High-Efficiency Air Purifier: The Corsi-Rosenthal Box

When commercial HEPA purifiers are expensive or sold out during winter smog spikes, a **Corsi-Rosenthal Box** delivers superior filtration (CADR ~350–500 CFM) for under $40-$50.

#### What You Need:
1. **One 20" Box Fan** (approx. $20)
2. **Four 20" x 20" x 1" or 2" MERV 13 Furnace Filters** (approx. $6–$8 each)
3. **Cardboard box base & Shroud** (cut a circular opening matching fan blades)
4. **Duct tape or Painter’s tape**

#### Step-by-Step Build:
1. **Arrange Filters**: Form a cube with the 4 MERV-13 filters as side walls, ensuring arrow markings point **inward** toward the center.
2. **Bottom Seal**: Tape a 20" x 20" cardboard square to seal the bottom completely.
3. **Top Mount**: Place the box fan on top, blowing **upward** away from the cube.
4. **Cardboard Shroud**: Tape a circular cardboard ring on top of the fan grill. *Why?* This prevents air vortex backflow at blade tips, boosting air throughput by 40%!
5. **Duct Tape All Edges**: Seal all seams airtight.

#### Direct Impact:
- **CADR**: ~420 CFM (cleans a 400 sq ft room in ~12 minutes).
- **Particle Removal**: Traps >85% of fine PM2.5 and viral aerosol particles per single pass.`;
  }

  // Limited budget user handling
  if (query.includes('cheap') || query.includes('budget') || query.includes('low cost') || query.includes('free') || profile?.budgetTier === 'low') {
    return `### 💡 Zero-Cost & Low-Budget Smog Hacks ($0 – $40)

You don't need a $400 designer purifier to protect your household from winter smog.

#### 1. Zero-Cost Behavioral Tweaks ($0)
- **Damp-Wiping over Sweeping**: Dry broom sweeping re-suspends settled PM2.5 into your breathing zone for over 3 hours. Use a damp cloth ($0).
- **Pot Lids & Exhaust Timing**: Keep lids tightly on pots when cooking, and turn range hoods on 1 minute before burner ignition.
- **Door Draft Stopper**: Roll up a damp bath towel and place it firmly under exterior door gaps to block drafting smog.

#### 2. DIY Corsi-Rosenthal Box (~$35–$45)
- Standard 20" box fan ($20) + 4x MERV-13 pleated filters ($6 each) + duct tape.
- Delivers Clean Air Delivery Rate (CADR) of **400+ CFM**, matching commercial $350 HEPA units.

#### 3. Low-Cost Personal Respirators
- Fitted **KF94 or N95 masks** can be safely rotated across 5 days if stored dry in paper bags between uses.`;
  }

  // Asthmatic / Child / Elderly protection
  if (query.includes('asthma') || query.includes('child') || query.includes('baby') || query.includes('elderly') || query.includes('vulnerab')) {
    return `### 🩺 High-Risk Action Plan: Protecting Asthmatics, Children & Seniors in Winter Smog

Current conditions in **${city}** (AQI ${aqiVal}, PM2.5: ${pm25Val} µg/m³) represent a serious respiratory hazard. Children have higher minute ventilation rates per kg of body weight, meaning they inhale twice as many pollutants relative to lung volume.

#### Immediate Protective Interventions:
1. **Move Morning Workouts Indoors**:
   - Winter thermal inversions trap ultra-fine particulates closest to the soil and pavement before 10:00 AM.
   - Reschedule play or runs to indoor filtered environments.
2. **Respirator Protocol**:
   - Cloth masks and surgical masks leak >70% of PM2.5 around edges.
   - Use well-fitted **KF94 (pediatric)** or **N95/FFP2 (adults)** respirators with an adjustable nose wire.
3. **Create a "Clean Room" Sanctuary**:
   - Pick the primary bedroom, seal gaps under doors with silicone sweeps or damp towels, and keep an air purifier running continuously on low/medium.
4. **Hydration & Saline Rinse**:
   - Maintain 40–50% indoor relative humidity. Dry winter air paralyzes respiratory cilia.
   - Use saline nasal rinses post-commute to clear coarse inhaled particles from nasal passages.`;
  }

  // Inversion explanation
  if (query.includes('inversion') || query.includes('why') || query.includes('smog') || query.includes('winter')) {
    return `### 🌫️ Why Winter Smog is So Toxic: The Atmospheric Inversion Phenomenon

During summer, the ground is heated by strong sunlight, so warm air near the ground naturally rises and dilutes urban exhaust into the upper troposphere.

#### What Happens in Winter?
1. **Radiation Cooling**: Long, clear winter nights rapidly cool the Earth's surface.
2. **Thermal Inversion Cap**: A warm layer of air forms aloft, sitting like a giant thermal "lid" over the city.
3. **Trapped Valley/Basin Exhaust**: Vehicle tailpipes, biomass burning, and industrial emissions cannot rise. They concentrate in the lowest 100 meters of the atmosphere.
4. **Secondary Aerosol Formation**: High morning humidity converts sulfur and nitrogen gases into hazardous secondary nitrates and sulfate particles.

#### When Can You Air Your Home?
- **Golden Window**: **12:00 PM – 2:30 PM**. Direct solar heating breaks the inversion lid, allowing surface air to disperse vertically.`;
  }

  // Daily routine recommendations
  if (query.includes('routine') || query.includes('daily') || query.includes('commute') || query.includes('schedule')) {
    return `### 📅 Smart Smog-Resilient Daily Routine for ${city}

Adapting the timing of your daily activities reduces inhaled particulate dose by **60% to 75%**:

1. **06:30 – 08:00 AM (Smog Peak)**:
   - Keep windows closed. Perform indoor stretches or light cardio inside your filtered clean room.
2. **08:30 – 09:30 AM (Commute)**:
   - Car cabin: Switch HVAC to **Internal Recirculation**. Do not pull raw highway air.
   - Public Transit: Opt for underground metro stations or electric buses; wear a fitted N95 respirator.
3. **12:30 – 02:00 PM (Inversion Lifting)**:
   - The only safe 15–20 minute window for whole-home cross-ventilation.
4. **05:30 – 07:00 PM (Evening Traffic Rush)**:
   - Avoid school gate idling. Walk or wait in indoor lobbies rather than curbside pickup zones.
5. **08:00 – 10:00 PM (Heating & Cooking)**:
   - Always run the range hood when boiling or sautéing.
   - Replace biomass or wood stoves with ceramic electric heating or heat pumps to prevent deadly indoor carbon monoxide and PAH build-up.`;
  }

  // General comprehensive response
  return `### 🛡️ BreatheSmart Smog Advisory for ${city} (AQI: ${aqiVal})

Navigating severe winter pollution requires a dual approach: **Personal Health Defense** and **Low-Emission Community Choices**.

#### 1. Indoor Air Quality (IAQ) Hacks
- **Damp-Wiping over Sweeping**: Dry sweeping re-suspends coarse and fine dust into your breathing zone for hours. Use damp microfiber cloths.
- **Cooking Exhaust**: Gas stoves produce high NO2 and ultrafine particles. Run mechanical exhaust 2 minutes prior to lighting and cover frying pans with lids.
- **DIY Filtration**: If you don't own a purifier, assemble a 4-filter Corsi-Rosenthal box for under $40.

#### 2. Clean Commuting & Sustainable Alternatives
- **Carpooling & Electric Transit**: Every 10 km shifted from a solo combustion car avoids ~1.85 kg of CO2 and prevents localized NO2 concentration near school zones.
- **Clean Heating**: Transition away from wood, coal, or kerosene space heaters to high-efficiency heat pumps or electric ceramic heaters.

#### 3. Protecting Family Members
- Check the **Daily Routine Planner** tab to see your personalized schedule and calculate your exact inhaled PM2.5 dose reduction.`;
}
