export type Cat = "s" | "p" | "m";
export const CATS: Record<Cat, string> = {
  s: "Surveillance and controlled access",
  p: "Perimeter protection and electrical support",
  m: "Monitoring and support",
};

export const SERVICES: { name: string; cat: Cat; short: string; long: string; icon: string }[] = [
  { name: "CCTV surveillance", cat: "s", icon: "cam", short: "Cameras, recording and remote viewing.", long: "Installation, upgrades, repairs and maintenance for entrances, parking areas, shared spaces and boundaries, with remote viewing and backup power for cameras and recorders." },
  { name: "Access control and biometrics", cat: "s", icon: "lock", short: "Fingerprint, face, cards and keypads.", long: "Fingerprint readers, facial recognition, cards, tags and keypads for residents, employees and visitors, with permissions set up for your site." },
  { name: "Security alarms and intercoms", cat: "s", icon: "bell", short: "Sensors, sirens and visitor intercoms.", long: "Door contacts, motion detectors, sirens and visitor intercoms, installed, repaired and maintained with battery backup." },
  { name: "Networking and Wi-Fi", cat: "s", icon: "wifi", short: "Cabling, switches, routers and Wi-Fi.", long: "Structured cabling, data points, switches, routers and Wi-Fi to support cameras, access control and everyday connectivity." },
  { name: "Gate motors", cat: "p", icon: "gate", short: "Installation, servicing and repairs.", long: "Installation, servicing, repairs and replacement, including remote programming, safety beams and battery checks." },
  { name: "Electric fencing", cat: "p", icon: "bolt", short: "Boundary fencing, repairs and fault finding.", long: "Installation, repairs and maintenance for property boundaries, including energiser checks, wiring repairs, insulators and fault finding." },
  { name: "Electrical", cat: "p", icon: "plug", short: "Lighting, plugs, switches and distribution boards.", long: "Electrical installations, upgrades, repairs and fault finding, with supplies assessed for the safe running of security and automation equipment." },
  { name: "Solar and backup power", cat: "p", icon: "sun", short: "Panels, inverters and batteries.", long: "Solar panels, inverters and battery storage, sized around your equipment loads, essential circuits and the operating time you need." },
  { name: "Online community watch", cat: "m", icon: "eye", short: "Connected cameras for complexes.", long: "Connected cameras for residential complexes, with authorised remote access for representatives and security teams." },
  { name: "Monitoring rooms and mobile viewing", cat: "m", icon: "mon", short: "Live viewing and playback.", long: "Live viewing and playback on monitoring-room screens and mobile apps, with user permissions for each role." },
  { name: "24-hour support", cat: "m", icon: "clock", short: "Remote troubleshooting and site help.", long: "Remote troubleshooting and coordination of maintenance or site assistance. Response times and on-site attendance are set in your service agreement." },
];
export const SERVICE_NAMES = [...SERVICES.map((s) => s.name), "Other"];
export const PROPERTY_TYPES = ["Residential", "Commercial", "Industrial"];
export const REQUEST_KINDS = ["New installation", "Upgrade", "Fault or repair", "Maintenance"];

export const STEPS = [
  ["Assess the property", "We discuss your priorities and inspect entrances, coverage, perimeter, cable routes and power."],
  ["Plan and quote", "You get recommended equipment, layouts and installation costs. We agree the work first."],
  ["Install and configure", "We install the agreed equipment and set up recording, access and remote viewing."],
  ["Test and commission", "We check cameras, readers, gates, network and backup power, and fix any issues."],
  ["Handover and support", "We show you everyday use, explain maintenance and support you after install."],
];

export const SEGMENTS = [
  ["Residential", "Homes, apartment buildings, residential complexes and estates.", ["Entrance cameras and intercoms", "Gate automation and electric fencing", "Online community watch", "Solar and battery backup for essential loads"]],
  ["Commercial", "Office buildings, retail premises and corporate facilities.", ["CCTV for entrances, reception and parking", "Access control and biometrics", "Central viewing and mobile access for managers", "Solar and backup power for selected circuits"]],
  ["Industrial", "Factories, warehouses, workshops and distribution premises.", ["Surveillance for loading bays, yards and perimeter", "Access to restricted areas", "Electric fencing, gate motors and structured cabling", "Solar, inverter and battery systems planned around essential loads"]],
] as const;

export const FAQ = [
  ["Do you work on systems that are already installed?", "Yes. Our service covers new installations, upgrades, fault finding and maintenance."],
  ["Can I view my cameras from my phone?", "Yes. Remote viewing and mobile access are configured to suit your site and network, with user permissions for each person."],
  ["What happens during a power outage?", "Battery and solar backup can be included for cameras, recorders, access control, gates and network equipment, sized to the operating time you need."],
  ["How does a quote work?", "We assess your property first, then recommend equipment and layouts and present the scope and installation costs. We agree the work and schedule before installation."],
  ["Is support available after hours?", "Yes, we offer 24-hour support. Response times and on-site attendance are set in your agreed service scope."],
];

export const QUOTE_CODE: Record<string, string> = {
  "CCTV surveillance": "CCTV", "Access control and biometrics": "ACCESS", "Security alarms and intercoms": "ALARM",
  "Networking and Wi-Fi": "NET", "Gate motors": "GATE", "Electric fencing": "FENCE", Electrical: "ELEC",
  "Solar and backup power": "SOLAR", "Online community watch": "CCTV",
};

