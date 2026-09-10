/**
 * 21-Point Digital Vehicle Health Inspection (DVI)
 */

export const INSPECTION_CATEGORIES = [
  {
    category: "Engine & Powertrain",
    icon: "activity",
    items: [
      { id: "eng_oil_lvl", label: "Engine Oil Level & Viscosity", defStatus: "good", hint: "Checked dipstick level, color & smell" },
      { id: "spark_health", label: "Spark Plug Electrode & Gap", defStatus: "good", hint: "0.8mm gap clearance & carbon deposit" },
      { id: "air_flt_state", label: "Air Filter Cleanliness", defStatus: "attention", hint: "Dust clog level & paper element state" },
      { id: "tappet_clr", label: "Tappet & Valve Clearance Sound", defStatus: "good", hint: "No clicking or noisy valve chatter" }
    ]
  },
  {
    category: "Braking & Safety",
    icon: "shield-alert",
    items: [
      { id: "brk_pad_front", label: "Front Brake Pads / Disc Wear", defStatus: "attention", hint: "Pad thickness > 2.5mm and rotor groove" },
      { id: "brk_shoe_rear", label: "Rear Drum Brake Shoe & Cam", defStatus: "good", hint: "Brake lever play within 15-20mm" },
      { id: "brk_fluid_dot", label: "Brake Fluid Moisture Level (DOT 4)", defStatus: "good", hint: "Clear golden amber, no dark discoloration" },
      { id: "brk_lines", label: "Hydraulic Hose & Cable Tension", defStatus: "good", hint: "No outer rubber cracks or fluid weeping" }
    ]
  },
  {
    category: "Electricals & Battery",
    icon: "zap",
    items: [
      { id: "bat_voltage", label: "12V Battery Cranking Voltage", defStatus: "good", hint: "Resting > 12.6V, Cranking > 10.2V" },
      { id: "head_tail_lights", label: "Headlight, Pilot, Tail & Brake Light", defStatus: "good", hint: "High/Low beam & brake switch activation" },
      { id: "indicators_horn", label: "Turn Signals, Hazard & Dual Horn", defStatus: "good", hint: "Blinker relay frequency & decibel level" },
      { id: "wiring_harness", label: "Wiring Loom & Fuse Box Integrity", defStatus: "good", hint: "No rodent bites or exposed copper joints" }
    ]
  },
  {
    category: "Chassis, Steering & Suspension",
    icon: "compass",
    items: [
      { id: "steer_cone", label: "Handlebar Cone Set & Head Bearings", defStatus: "good", hint: "Smooth free rotation without center notch" },
      { id: "fork_seal", label: "Front Telescopic Fork Oil Seals", defStatus: "attention", hint: "No oily film or dust ring on stanchion" },
      { id: "rear_shockers", label: "Rear Monoshock / Twin Dampers", defStatus: "good", hint: "Rebound damping test, no fluid seepage" },
      { id: "chassis_fasteners", label: "Main Frame, Engine Mounting Bolts", defStatus: "good", hint: "Torqued to factory specifications" }
    ]
  },
  {
    category: "Tyres, Wheels & Drive",
    icon: "circle-dot",
    items: [
      { id: "front_tyre", label: "Front Tyre Tread Depth & Pressure", defStatus: "good", hint: "Tread > 2mm, Pressure 28-30 PSI" },
      { id: "rear_tyre", label: "Rear Tyre Tread Depth & Pressure", defStatus: "good", hint: "Tread > 2mm, Pressure 32-36 PSI" },
      { id: "wheel_truing", label: "Alloy Rim Runout / Spoke Truing", defStatus: "good", hint: "No rim bend or high-speed wobble" },
      { id: "chain_slack", label: "Drive Chain Tension & Sprocket Wear", defStatus: "attention", hint: "Chain slack 25-30mm, lube coating" },
      { id: "wheel_bearings", label: "Front & Rear Wheel Hub Bearings", defStatus: "good", hint: "Spin free with zero lateral axle play" }
    ]
  }
];
