/**
 * Quick Service Packages & Annual Maintenance Plans
 */

export const SERVICE_PACKAGES = [
  {
    id: "pkg_basic",
    name: "Express Quick Service",
    tier: "basic",
    price: 649,
    originalPrice: 850,
    duration: "45 Mins",
    badge: "Most Popular",
    icon: "🥉",
    description: "Quick turnaround essential maintenance for daily commuter bikes & scooters.",
    includes: [
      "Engine Oil Top-up & Quality Check",
      "15-Point Safety & Brake Check",
      "Drive Chain Lubrication & Slack Adjust",
      "Air Filter Dust Cleaning",
      "High-Pressure Foam Water Wash"
    ],
    items: [
      {
        key: "pkg_basic_oil",
        label: "Engine Oil Top-Up & Filter Clean",
        category: "Routine Service",
        severity: "routine",
        part: "Castrol / Motul 4T Top-up (500ml)",
        partCost: 280,
        laborCost: 120,
        duration: 15,
        icon: "droplet"
      },
      {
        key: "pkg_basic_check",
        label: "15-Pt Safety & Brake Inspection",
        category: "Routine Service",
        severity: "routine",
        part: "Chain Lube Spray + Fasteners Check",
        partCost: 100,
        laborCost: 149,
        duration: 30,
        icon: "shield-check"
      }
    ]
  },
  {
    id: "pkg_standard",
    name: "Periodic Standard Care",
    tier: "standard",
    price: 1299,
    originalPrice: 1650,
    duration: "2 - 3 Hours",
    badge: "Recommended (Every 3,000 km)",
    icon: "🥈",
    description: "Comprehensive periodic maintenance to keep engine smooth and fuel efficient.",
    includes: [
      "Full Semi-Synthetic Engine Oil Flush & Refill",
      "Front & Rear Brake Overhaul & Drum Cleaning",
      "Spark Plug Cleaning & Gap Setting",
      "Battery Terminal & Charging Voltage Scan",
      "Throttle Cable & Clutch Free-Play Tuning",
      "High-Gloss Teflon Body Wash & Polish"
    ],
    items: [
      {
        key: "pkg_std_oil",
        label: "Semi-Synthetic Oil Replacement (1L)",
        category: "Engine & Fluids",
        severity: "routine",
        part: "Motul 5100 15W50 Semi-Synthetic Oil + O-Ring",
        partCost: 450,
        laborCost: 150,
        duration: 25,
        icon: "droplet"
      },
      {
        key: "pkg_std_brakes",
        label: "Brake Liners Overhaul & De-Glazing",
        category: "Brakes & Safety",
        severity: "moderate",
        part: "Brake Cleaner & Anti-Squeal Paste",
        partCost: 180,
        laborCost: 220,
        duration: 35,
        icon: "disc"
      },
      {
        key: "pkg_std_tune",
        label: "Spark Plug Decarb & Carb/EFI Tuning",
        category: "Fuel & Ignition",
        severity: "routine",
        part: "Spark Plug Cleaner & Gasket Set",
        partCost: 120,
        laborCost: 179,
        duration: 30,
        icon: "zap"
      }
    ]
  },
  {
    id: "pkg_pro",
    name: "Comprehensive Super Tune-Up",
    tier: "pro",
    price: 2199,
    originalPrice: 2890,
    duration: "4 - 5 Hours",
    badge: "Full Overhaul",
    icon: "🥇",
    description: "Deep diagnostic overhaul for high mileage bikes, performance motorcycles and long tours.",
    includes: [
      "100% Fully Synthetic Motul 7100 Oil Change",
      "Front Fork Suspension Oil Overhaul & Seal Test",
      "Handlebar Cone-Set Greasing & Alignment",
      "Complete Fuel Injector / Carburetor Decarb",
      "Brake Fluid Bleeding & New Pad Fitment Check",
      "Premium 3M Foam Wash, Engine Degreasing & Wax"
    ],
    items: [
      {
        key: "pkg_pro_oil",
        label: "Fully Synthetic Motul 7100 Oil Change",
        category: "Engine & Fluids",
        severity: "routine",
        part: "Motul 7100 10W40 100% Synthetic 1L",
        partCost: 850,
        laborCost: 200,
        duration: 30,
        icon: "droplet"
      },
      {
        key: "pkg_pro_fork",
        label: "Front Fork Overhaul & Cone-Set Greasing",
        category: "Suspension & Steering",
        severity: "moderate",
        part: "Fork Oil Grade 10W + Cone-Set Heavy Grease",
        partCost: 350,
        laborCost: 380,
        duration: 60,
        icon: "move-vertical"
      },
      {
        key: "pkg_pro_tune",
        label: "Injector Ultrasonic Clean & Full Electrical Scan",
        category: "Engine Decarb",
        severity: "moderate",
        part: "Throttle Body Cleaner + Contact Cleaner",
        partCost: 220,
        laborCost: 199,
        duration: 45,
        icon: "cpu"
      }
    ]
  },
  {
    id: "pkg_ev",
    name: "EV Smart Shield Care",
    tier: "ev",
    price: 899,
    originalPrice: 1200,
    duration: "1.5 Hours",
    badge: "Ola / Ather / TVS iQube",
    icon: "🔋",
    description: "Dedicated electric two-wheeler health checkup, motor controller tuning & belt care.",
    includes: [
      "Lithium-Ion Battery Pack Health & Cell Balance Scan",
      "Hub / Mid-Drive Motor Controller Calibration",
      "Drive Belt Tension & Wear Alignment",
      "Regenerative Braking Sensor Testing",
      "IP67 Wiring Harness Insulation Check",
      "Waterless Anti-Static Wash & Dry Detail"
    ],
    items: [
      {
        key: "pkg_ev_battery",
        label: "EV Battery Health & BMS Diagnostic Scan",
        category: "EV Powertrain",
        severity: "routine",
        part: "OBD Digital Battery Health Certificate",
        partCost: 250,
        laborCost: 250,
        duration: 30,
        icon: "battery-charging"
      },
      {
        key: "pkg_ev_belt",
        label: "Drive Belt Tension & Regen Brake Tuning",
        category: "EV Powertrain",
        severity: "moderate",
        part: "Belt Dressing Spray & Torque Fasteners",
        partCost: 180,
        laborCost: 219,
        duration: 35,
        icon: "rotate-cw"
      }
    ]
  }
];
