// Scan Regions - Coordinates for OCR scanning (based on 1920x1080 showcases)

export const scanRegions = {
  // Character name region
  name: {
    left: 70,
    top: 26,
    width: 450,
    height: 60,
  },

  // Echo regions (5 echoes)
  echoRegions: [
    {
      left: 22,
      top: 651,
      width: 190,
      height: 180,
    },
    {
      left: 397,
      top: 651,
      width: 190,
      height: 180,
    },
    {
      left: 771,
      top: 651,
      width: 190,
      height: 180,
    },
    {
      left: 1145,
      top: 651,
      width: 190,
      height: 180,
    },
    {
      left: 1518,
      top: 651,
      width: 190,
      height: 180,
    },
  ],

  // Echo set icons
  setIcons: [
    { left: 268, top: 663, width: 48, height: 48 },
    { left: 641, top: 663, width: 48, height: 48 },
    { left: 1015, top: 663, width: 48, height: 48 },
    { left: 1390, top: 663, width: 48, height: 48 },
    { left: 1764, top: 663, width: 48, height: 48 },
  ],

  // Echo cost icons
  costIcons: [
    { left: 323, top: 664, width: 47, height: 47 },
    { left: 696, top: 664, width: 47, height: 47 },
    { left: 1070, top: 664, width: 47, height: 47 },
    { left: 1445, top: 664, width: 47, height: 47 },
    { left: 1819, top: 664, width: 47, height: 47 },
  ],

  // 5 groups of 5 stat lines each (for OCR scanning echo stats)
  statRegions: [
    // Group 1 (Echo 1)
    [
      { left: 65, top: 885, width: 310, height: 36 },
      { left: 65, top: 918, width: 310, height: 35 },
      { left: 65, top: 953, width: 310, height: 35 },
      { left: 65, top: 987, width: 310, height: 34 },
      { left: 65, top: 1021, width: 310, height: 35 },
    ],
    // Group 2 (Echo 2)
    [
      { left: 443, top: 885, width: 310, height: 36 },
      { left: 443, top: 918, width: 310, height: 35 },
      { left: 443, top: 953, width: 310, height: 35 },
      { left: 443, top: 987, width: 310, height: 34 },
      { left: 443, top: 1021, width: 310, height: 35 },
    ],
    // Group 3 (Echo 3)
    [
      { left: 817, top: 885, width: 310, height: 36 },
      { left: 817, top: 918, width: 310, height: 35 },
      { left: 817, top: 953, width: 310, height: 35 },
      { left: 817, top: 987, width: 310, height: 34 },
      { left: 817, top: 1021, width: 310, height: 35 },
    ],
    // Group 4 (Echo 4)
    [
      { left: 1191, top: 885, width: 310, height: 36 },
      { left: 1191, top: 918, width: 310, height: 35 },
      { left: 1191, top: 953, width: 310, height: 35 },
      { left: 1191, top: 987, width: 310, height: 34 },
      { left: 1191, top: 1021, width: 310, height: 35 },
    ],
    // Group 5 (Echo 5)
    [
      { left: 1565, top: 885, width: 310, height: 36 },
      { left: 1565, top: 918, width: 310, height: 35 },
      { left: 1565, top: 953, width: 310, height: 35 },
      { left: 1565, top: 987, width: 310, height: 34 },
      { left: 1565, top: 1021, width: 310, height: 35 },
    ],
  ],
};
