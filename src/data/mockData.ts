export interface SafetyAnalysis {
  risk_score: number;
  short_reason: string;
  detailed_reason: string[];
  recommended_route: string;
  nearest_help: Array<{
    name: string;
    distance_km: number;
    phone: string;
  }>;
  chat_lines: string[];
}

export const mockScenarios = {
  scenario_college_night: {
    risk_score: 78,
    short_reason: "Dim street lights and low foot traffic at night near Link Road.",
    detailed_reason: [
      "3 incidents reported in past 12 months within 500m",
      "Low streetlight density, CCTV coverage none",
      "Isolated stretch with low pedestrian traffic after 10 PM"
    ],
    recommended_route: "Take Main Road (Route B) — slightly longer but better lit and passes by police chowki.",
    nearest_help: [
      {
        name: "Bandra Police Station",
        distance_km: 1.2,
        phone: "+91-22-2642-2222"
      }
    ],
    chat_lines: [
      "EN: This route has poor lighting and past incidents — I recommend Route B via Main Road.",
      "HI: यह रास्ता रात में कम रोशनी और पहले की रिपोर्ट्स के कारण जोखिम भरा है — मैं Main Road सुझाता हूँ।"
    ]
  },
  
  scenario_bus_deviate: {
    risk_score: 45,
    short_reason: "Bus deviated from its geofence; ETA increased.",
    detailed_reason: [
      "Bus off the planned path by 1.3 km",
      "ETA increased by 8 minutes"
    ],
    recommended_route: "Notify driver and ask to rejoin designated route. Alert parent with current location.",
    nearest_help: [
      {
        name: "Local Police Chowki",
        distance_km: 0.8,
        phone: "+91-22-2642-3333"
      }
    ],
    chat_lines: [
      "EN: Bus is off-route. ETA +8 mins. Should I alert parent and request driver to rejoin?",
      "HI: बस निर्धारित रूट से भटक गई है। ETA +8 मिनट। क्या मैं पेरेंट को अलर्ट करूँ?"
    ]
  }
};

export type ScenarioKey = keyof typeof mockScenarios;