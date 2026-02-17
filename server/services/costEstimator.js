// Decorpot pricing structure extracted from real quotation reference
// All rates are per sq ft unless noted as per quantity

const MATERIAL_RATES = {
  plywoodLaminate: { rate: 1394, label: 'Plywood + Laminate Finish' },
  plywoodLaminateKitchen: { rate: 1498, label: 'Kitchen Grade Plywood + Laminate' },
  plywoodLaminateWardrobe: { rate: 1297, label: 'Wardrobe Grade Plywood + Laminate' },
  aluminiumFrameGlass: { rate: 2594, label: 'Aluminium Frame with Tinted/Fluted Glass' },
  paneling: { rate: 818, label: 'Wall Paneling / Ledge' },
  loft: { rate: 891, label: 'Loft (Frame + Shutter)' },
  extendedLoft: { rate: 991, label: 'Extended Loft' },
  cncJali: { rate: 840, label: 'CNC Jali with Acrylic Backing' },
  mirror: { rate: 268, label: 'Mirror Fixed with Studs' },
  glassPartition: { rate: 800, label: 'Glass Partition with Hinged Door' },
  paintTractorEmulsion: { rate: 35.40, label: 'Tractor Emulsion (2 Putty + 1 Primer + 2 Paint)' },
};

const FIXED_ITEMS = {
  drawer: { rate: 2000, label: 'Standard Drawer' },
  externalDrawer: { rate: 5000, label: 'External Drawer with Fittings' },
  dresserDrawer: { rate: 4000, label: 'Dresser Drawer' },
  kingBedHydraulic: { rate: 41500, label: 'King Size Bed with Hydraulic Storage' },
  queenBedHydraulic: { rate: 35000, label: 'Queen Size Bed with Hydraulic Storage' },
  sideTable: { rate: 7300, label: 'Side Table (1 Drawer)' },
  baySittingCushion: { rate: 7468, label: 'Bay Sitting Cushion' },
  ssBaskets600: { rate: 3150, label: 'SS Finish Baskets 600mm (Hettich)' },
  orgaTray600: { rate: 1000, label: 'Orga Tray 600mm (Hettich)' },
  thaliInlet600: { rate: 1000, label: 'Thali Inlet 600mm (Hettich)' },
  bottlePullOut: { rate: 4250, label: 'Bottle Pull Out 2-Tier 150mm (Hettich)' },
  tandemBox: { rate: 5200, label: 'Tandem Box (Hettich)' },
  softClosingChannel: { rate: 1000, label: 'Soft Closing Channel (Hettich)' },
  softClosingHinge: { rate: 400, label: 'Soft Closing Hinge (Hettich)' },
  debrisRemoval: { rate: 5000, label: 'Debris Removal' },
  floorCovering: { rate: 9144, label: 'Floor Covering with Floor Mat' },
  deepCleaning: { rate: 9144, label: 'Deep Cleaning of Furnitures' },
  fullHouseElectrical: { rate: 128000, label: 'Full House Electrical Work' },
};

const ROOM_TEMPLATES = {
  'Foyer': {
    items: [
      { name: 'Shoe Unit', material: 'plywoodLaminate', area: 12 },
    ],
  },
  'Living Room': {
    items: [
      { name: 'TV Unit Paneling', material: 'paneling', area: 28 },
      { name: 'TV Unit Below Storage', material: 'plywoodLaminate', area: 6 },
      { name: 'TV Unit Side Storage', material: 'aluminiumFrameGlass', area: 14 },
      { name: 'Drawers', fixed: 'drawer', qty: 2 },
    ],
  },
  'Dining Area': {
    items: [
      { name: 'Crockery Unit Bottom', material: 'plywoodLaminate', area: 9 },
      { name: 'Crockery Unit Top (Glass)', material: 'aluminiumFrameGlass', area: 6 },
    ],
  },
  'Kitchen': {
    items: [
      { name: 'Kitchen Bottom Cabinet', material: 'plywoodLaminateKitchen', area: 43 },
      { name: 'Kitchen Top Cabinet (Glass)', material: 'aluminiumFrameGlass', area: 26 },
      { name: 'Loft', material: 'loft', area: 26 },
      { name: 'Extended Loft', material: 'extendedLoft', area: 6 },
      { name: 'Kitchen Tall Unit', material: 'plywoodLaminateKitchen', area: 14 },
      { name: 'SS Baskets 600mm', fixed: 'ssBaskets600', qty: 3 },
      { name: 'Orga Tray 600mm', fixed: 'orgaTray600', qty: 1 },
      { name: 'Thali Inlet 600mm', fixed: 'thaliInlet600', qty: 1 },
      { name: 'Bottle Pull Out', fixed: 'bottlePullOut', qty: 1 },
      { name: 'Tandem Box', fixed: 'tandemBox', qty: 2 },
      { name: 'Soft Closing Channels', fixed: 'softClosingChannel', qty: 5 },
      { name: 'Soft Closing Hinges', fixed: 'softClosingHinge', qty: 14 },
    ],
  },
  'Master Bedroom': {
    items: [
      { name: 'Wardrobe', material: 'plywoodLaminateWardrobe', area: 42 },
      { name: 'Loft', material: 'loft', area: 12 },
      { name: 'Dresser with Storage', material: 'plywoodLaminate', area: 7.5 },
      { name: 'Mirror', material: 'mirror', area: 7.5 },
      { name: 'Dresser Drawer', fixed: 'dresserDrawer', qty: 1 },
      { name: 'Side Table', fixed: 'sideTable', qty: 1 },
      { name: 'Custom Headboard with Cushion', material: 'plywoodLaminate', area: 12 },
      { name: 'King Size Bed with Hydraulic', fixed: 'kingBedHydraulic', qty: 1 },
    ],
  },
  'Bedroom': {
    items: [
      { name: 'Study Unit Ledge', material: 'paneling', area: 12 },
      { name: 'Study Table Top Storage', material: 'plywoodLaminate', area: 8 },
      { name: 'Study Unit Tall Unit', material: 'plywoodLaminate', area: 14 },
      { name: 'External Drawers', fixed: 'externalDrawer', qty: 2 },
    ],
  },
  'Kids Room': {
    items: [
      { name: 'Study Unit Ledge', material: 'paneling', area: 12 },
      { name: 'Study Table Top Storage', material: 'plywoodLaminate', area: 8 },
      { name: 'Wardrobe', material: 'plywoodLaminateWardrobe', area: 30 },
      { name: 'Loft', material: 'loft', area: 8 },
      { name: 'External Drawers', fixed: 'externalDrawer', qty: 2 },
    ],
  },
  'Pooja Room': {
    items: [
      { name: 'Custom Pooja Unit', material: 'plywoodLaminate', area: 9 },
      { name: 'CNC Jali with Acrylic', material: 'cncJali', area: 4 },
      { name: 'Bottom Storage', material: 'plywoodLaminate', area: 6 },
      { name: 'Pooja Ledges', material: 'paneling', area: 4 },
      { name: 'Drawers', fixed: 'drawer', qty: 2 },
    ],
  },
  'Balcony': {
    items: [
      { name: 'Bay Sitting Storage', material: 'plywoodLaminate', area: 12 },
      { name: 'Bay Sitting Cushion', fixed: 'baySittingCushion', qty: 1 },
    ],
  },
  'Bathroom': {
    items: [
      { name: 'Bottom Cabinets', material: 'plywoodLaminateKitchen', area: 4 },
      { name: 'Top Cabinet with Storage', material: 'plywoodLaminateKitchen', area: 4 },
      { name: 'Mirror', material: 'mirror', area: 4 },
      { name: 'Glass Partition with Door', material: 'glassPartition', area: 28 },
    ],
  },
};

// Scale factors based on carpet area relative to reference (3BHK ~1200-1400 sqft)
function getAreaScaleFactor(carpetArea, roomCount) {
  const referenceArea = 1300;
  const ratio = carpetArea / referenceArea;
  return Math.max(0.6, Math.min(ratio, 2.0));
}

function calculateRoomCost(roomName, scaleFactor) {
  const template = ROOM_TEMPLATES[roomName];
  if (!template) return { total: 0, items: [] };

  const items = [];
  let total = 0;

  template.items.forEach((item) => {
    let cost = 0;
    let detail = {};

    if (item.material) {
      const mat = MATERIAL_RATES[item.material];
      const scaledArea = Math.round(item.area * scaleFactor * 10) / 10;
      cost = Math.round(scaledArea * mat.rate);
      detail = {
        name: item.name,
        material: mat.label,
        area: scaledArea,
        ratePerSqft: mat.rate,
        cost,
      };
    } else if (item.fixed) {
      const fix = FIXED_ITEMS[item.fixed];
      cost = fix.rate * item.qty;
      detail = {
        name: item.name,
        material: fix.label,
        qty: item.qty,
        ratePerUnit: fix.rate,
        cost,
      };
    }

    items.push(detail);
    total += cost;
  });

  return { total, items };
}

function estimateCost({ carpetArea, budget, rooms = [], propertyType }) {
  if (!carpetArea || !budget) {
    throw new Error('Carpet area and budget are required for estimation');
  }

  const carpetAreaNum = Number(carpetArea);
  const budgetNum = Number(budget);

  const scaleFactor = getAreaScaleFactor(carpetAreaNum, rooms.length);

  // Calculate room-wise costs
  const roomBreakdown = {};
  let modularTotal = 0;

  const selectedRooms = rooms.length > 0 ? rooms : Object.keys(ROOM_TEMPLATES);

  selectedRooms.forEach((room) => {
    const result = calculateRoomCost(room, scaleFactor);
    if (result.total > 0) {
      roomBreakdown[room] = {
        total: result.total,
        items: result.items,
      };
      modularTotal += result.total;
    }
  });

  // Others: Paint + Electrical + Hardware
  const paintArea = carpetAreaNum * 4;
  const paintCost = Math.round(paintArea * MATERIAL_RATES.paintTractorEmulsion.rate);
  const hardwareCost =
    FIXED_ITEMS.softClosingChannel.rate * 10 +
    FIXED_ITEMS.softClosingHinge.rate * 25;
  const electricalCost = FIXED_ITEMS.fullHouseElectrical.rate;
  const othersCost = paintCost + hardwareCost + electricalCost;

  roomBreakdown['Others (Paint, Electrical, Hardware)'] = {
    total: othersCost,
    items: [
      { name: 'Paint - Tractor Emulsion', area: paintArea, ratePerSqft: MATERIAL_RATES.paintTractorEmulsion.rate, cost: paintCost },
      { name: 'Soft Closing Hardware', qty: 35, cost: hardwareCost },
      { name: 'Full House Electrical Work', qty: 1, cost: electricalCost },
    ],
  };

  // Services
  const servicesCost =
    FIXED_ITEMS.debrisRemoval.rate +
    FIXED_ITEMS.floorCovering.rate +
    FIXED_ITEMS.deepCleaning.rate;

  roomBreakdown['Services'] = {
    total: servicesCost,
    items: [
      { name: 'Debris Removal', qty: 1, cost: FIXED_ITEMS.debrisRemoval.rate },
      { name: 'Floor Covering', qty: 1, cost: FIXED_ITEMS.floorCovering.rate },
      { name: 'Deep Cleaning', qty: 1, cost: FIXED_ITEMS.deepCleaning.rate },
    ],
  };

  const subtotalBeforeDiscount = modularTotal + othersCost + servicesCost;
  const discountPercent = 5;
  const discount = Math.round(subtotalBeforeDiscount * discountPercent / 100);
  const subtotal = subtotalBeforeDiscount - discount;
  const gstPercent = 18;
  const gst = Math.round(subtotal * gstPercent / 100);
  const estimatedCost = subtotal + gst;

  // Determine package type from budget
  let packageType;
  if (budgetNum < 800000) packageType = 'Essential';
  else if (budgetNum <= 1500000) packageType = 'Premium';
  else packageType = 'Luxury';

  // Simplified cost breakdown for summary
  const costBreakdown = {};
  Object.entries(roomBreakdown).forEach(([room, data]) => {
    costBreakdown[room] = data.total;
  });

  return {
    packageType,
    estimatedCost,
    costBreakdown,
    roomBreakdown,
    summary: {
      modularWorkTotal: modularTotal,
      othersCost,
      servicesCost,
      subtotalBeforeDiscount,
      discount,
      discountPercent,
      subtotal,
      gst,
      gstPercent,
      total: estimatedCost,
    },
    materials: {
      brand: 'Decorpot Standard',
      plywood: '303 MR Grade (Dry) / Green Ply 710 BWP (Wet)',
      laminate: 'Stylam / Airolam (1mm)',
      fittings: 'Hettich',
      glass: 'Modiguard / AIS / Saint Gobain',
    },
    warranty: '10 years on all woodwork',
    paymentSchedule: {
      'Design & Booking (10%)': Math.round(estimatedCost * 0.10),
      'Contract Signing (50%)': Math.round(estimatedCost * 0.50),
      'Before Delivery (40%)': Math.round(estimatedCost * 0.40),
    },
  };
}

module.exports = { estimateCost, MATERIAL_RATES, FIXED_ITEMS, ROOM_TEMPLATES };
