import os

dest_dir = r"c:\Aryan\Ati\student_portal\frontend\public\festivals"
os.makedirs(dest_dir, exist_ok=True)

svgs = {}

# 1. Gandhi Jayanti: Charkha / Spectacles / Tricolor aura
svgs["gandhi_jayanti.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_gandhi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3E0"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E8F5E9"/>
    </linearGradient>
    <filter id="shadow_g" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#8D6E63" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Base Circle -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_gandhi)" stroke="#FF9800" stroke-width="2.5"/>
  <!-- Tricolor Arc border accents -->
  <path d="M 25 25 A 50 50 0 0 1 95 25" fill="none" stroke="#FF9933" stroke-width="4" stroke-linecap="round"/>
  <path d="M 25 95 A 50 50 0 0 0 95 95" fill="none" stroke="#138808" stroke-width="4" stroke-linecap="round"/>
  
  <!-- Charkha Wheel (Spinning Wheel) -->
  <g filter="url(#shadow_g)">
    <circle cx="60" cy="56" r="32" fill="none" stroke="#5D4037" stroke-width="2.5" opacity="0.85"/>
    <circle cx="60" cy="56" r="5" fill="#5D4037"/>
    <!-- Spokes -->
    <line x1="60" y1="24" x2="60" y2="88" stroke="#8D6E63" stroke-width="1.2"/>
    <line x1="28" y1="56" x2="92" y2="56" stroke="#8D6E63" stroke-width="1.2"/>
    <line x1="37" y1="33" x2="83" y2="79" stroke="#8D6E63" stroke-width="1.2"/>
    <line x1="37" y1="79" x2="83" y2="33" stroke="#8D6E63" stroke-width="1.2"/>
  </g>
  
  <!-- Classic Round Spectacles (Gandhi Glasses) -->
  <g filter="url(#shadow_g)">
    <!-- Left Lens -->
    <circle cx="43" cy="58" r="14" fill="#FFFFFF" fill-opacity="0.8" stroke="#2E2E2E" stroke-width="3"/>
    <!-- Right Lens -->
    <circle cx="77" cy="58" r="14" fill="#FFFFFF" fill-opacity="0.8" stroke="#2E2E2E" stroke-width="3"/>
    <!-- Bridge -->
    <path d="M 57 55 Q 60 51 63 55" fill="none" stroke="#2E2E2E" stroke-width="3"/>
    <!-- Left arm -->
    <line x1="29" y1="54" x2="20" y2="51" stroke="#2E2E2E" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Right arm -->
    <line x1="91" y1="54" x2="100" y2="51" stroke="#2E2E2E" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Glass reflections -->
    <path d="M 37 50 L 47 62" stroke="#90CAF9" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <path d="M 71 50 L 81 62" stroke="#90CAF9" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  </g>

  <!-- Title Pill -->
  <rect x="22" y="90" width="76" height="18" rx="9" fill="#2E7D32"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5">GANDHI JAYANTI</text>
</svg>
"""

# 2. Navratri / Maha Navami: Dandiya & Goddess Durga motifs
svgs["navratri.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_nav" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF8E1"/>
      <stop offset="60%" stop-color="#FFE082"/>
      <stop offset="100%" stop-color="#FFB300"/>
    </radialGradient>
    <linearGradient id="stick1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E91E63"/>
      <stop offset="50%" stop-color="#FF4081"/>
      <stop offset="100%" stop-color="#C2185B"/>
    </linearGradient>
    <linearGradient id="stick2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00BCD4"/>
      <stop offset="50%" stop-color="#26C6DA"/>
      <stop offset="100%" stop-color="#0097A7"/>
    </linearGradient>
    <filter id="shadow_nav" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#E65100" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_nav)" stroke="#FF6F00" stroke-width="2.5"/>
  <!-- Decorative Ring -->
  <circle cx="60" cy="60" r="48" fill="none" stroke="#D84315" stroke-width="1.5" stroke-dasharray="3,3"/>

  <!-- Goddess Durga Trinetra & Tilak Motif at Top -->
  <g transform="translate(60, 32)">
    <!-- Red Chandan Tilak -->
    <path d="M 0 -12 C 4 -7 4 -2 0 4 C -4 -2 -4 -7 0 -12 Z" fill="#D50000"/>
    <circle cx="0" cy="8" r="2.5" fill="#FFD600"/>
    <!-- Left Eye -->
    <path d="M -22 0 Q -10 -9 0 0 Q -10 6 -22 0 Z" fill="#FFFFFF" stroke="#212121" stroke-width="1.5"/>
    <circle cx="-11" cy="0" r="3.5" fill="#212121"/>
    <!-- Right Eye -->
    <path d="M 22 0 Q 10 -9 0 0 Q 10 6 22 0 Z" fill="#FFFFFF" stroke="#212121" stroke-width="1.5"/>
    <circle cx="11" cy="0" r="3.5" fill="#212121"/>
  </g>

  <!-- Crossed Dandiya Sticks -->
  <g filter="url(#shadow_nav)">
    <!-- Dandiya 1 (Pink/Gold) -->
    <rect x="-35" y="-5" width="70" height="9" rx="4.5" transform="translate(60, 64) rotate(42)" fill="url(#stick1)" stroke="#FFD700" stroke-width="1.5"/>
    <!-- Dandiya 2 (Cyan/Gold) -->
    <rect x="-35" y="-5" width="70" height="9" rx="4.5" transform="translate(60, 64) rotate(-42)" fill="url(#stick2)" stroke="#FFD700" stroke-width="1.5"/>
    <!-- Ghungroo / Bells & Ribbons -->
    <circle cx="60" cy="64" r="5" fill="#FFD700" stroke="#FF6F00" stroke-width="1.5"/>
    <!-- Sparkles -->
    <polygon points="60,18 62,23 67,23 63,26 65,31 60,28 55,31 57,26 53,23 58,23" fill="#FFD700"/>
    <polygon points="25,50 26,53 29,53 27,55 28,58 25,56 22,58 23,55 21,53 24,53" fill="#FFD700"/>
    <polygon points="95,50 96,53 99,53 97,55 98,58 95,56 92,58 93,55 91,53 94,53" fill="#FFD700"/>
  </g>

  <!-- Bottom Pill -->
  <rect x="22" y="90" width="76" height="18" rx="9" fill="#C2185B"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5">MAHA NAVAMI</text>
</svg>
"""

# 3. Dussehra / Vijayadashami: Golden Bow & Arrow (Rama) striking victory
svgs["dussehra.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_dus" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF3E0"/>
      <stop offset="60%" stop-color="#FFE0B2"/>
      <stop offset="100%" stop-color="#FF9800"/>
    </radialGradient>
    <linearGradient id="bow_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD54F"/>
      <stop offset="50%" stop-color="#FF8F00"/>
      <stop offset="100%" stop-color="#BF360C"/>
    </linearGradient>
    <linearGradient id="arrow_grad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#B71C1C"/>
      <stop offset="60%" stop-color="#FF5722"/>
      <stop offset="100%" stop-color="#FFEB3B"/>
    </linearGradient>
    <filter id="shadow_dus" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#D84315" flood-opacity="0.4"/>
    </filter>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_dus)" stroke="#E65100" stroke-width="2.5"/>
  <!-- Sunburst aura -->
  <circle cx="60" cy="60" r="48" fill="none" stroke="#FFB74D" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- Divine Flaming Bow & Arrow -->
  <g filter="url(#shadow_dus)">
    <!-- Golden Bow (Dhanush) -->
    <path d="M 28 72 C 32 30 88 30 92 72" fill="none" stroke="url(#bow_grad)" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M 28 72 C 32 30 88 30 92 72" fill="none" stroke="#FFF" stroke-width="1" stroke-dasharray="2,6"/>
    <!-- Bow string (Pratyancha) -->
    <line x1="28" y1="72" x2="60" y2="65" stroke="#FFFFFF" stroke-width="1.8"/>
    <line x1="92" y1="72" x2="60" y2="65" stroke="#FFFFFF" stroke-width="1.8"/>

    <!-- Sharp Flaming Arrow (Baan) pointing UP -->
    <!-- Shaft -->
    <line x1="60" y1="20" x2="60" y2="78" stroke="url(#arrow_grad)" stroke-width="3" stroke-linecap="round"/>
    <!-- Golden Arrowhead -->
    <polygon points="60,14 52,28 60,24 68,28" fill="#FFEB3B" stroke="#E65100" stroke-width="1.2"/>
    <!-- Flaming Glow on Arrowhead -->
    <circle cx="60" cy="18" r="7" fill="#FF5722" fill-opacity="0.35"/>
    <!-- Feather Fletching -->
    <path d="M 54 75 L 60 70 L 66 75 L 60 78 Z" fill="#FF8F00"/>
    <path d="M 52 82 L 60 76 L 68 82 L 60 85 Z" fill="#D84315"/>
  </g>

  <!-- Victory Sparkles -->
  <polygon points="30,30 32,34 36,34 33,37 34,41 30,38 26,41 27,37 24,34 28,34" fill="#FFD700"/>
  <polygon points="90,30 92,34 96,34 93,37 94,41 90,38 86,41 87,37 84,34 88,34" fill="#FFD700"/>

  <!-- Bottom Pill -->
  <rect x="22" y="90" width="76" height="18" rx="9" fill="#E65100"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5">DUSSEHRA</text>
</svg>
"""

# 4. Diwali / Deepawali: Ornate Golden Diya with Glowing Flame & Rangoli
svgs["diwali.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_diw" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2A1052"/>
      <stop offset="60%" stop-color="#1A0836"/>
      <stop offset="100%" stop-color="#0C041A"/>
    </radialGradient>
    <linearGradient id="flame" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FF5722"/>
      <stop offset="40%" stop-color="#FF9800"/>
      <stop offset="70%" stop-color="#FFEB3B"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
    <linearGradient id="diya_body" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="50%" stop-color="#FFB300"/>
      <stop offset="100%" stop-color="#FF6F00"/>
    </linearGradient>
    <filter id="glow_f" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_diw)" stroke="#FFD54F" stroke-width="2.5"/>

  <!-- Rangoli Base Pattern -->
  <circle cx="60" cy="74" r="32" fill="none" stroke="#E91E63" stroke-width="2" stroke-dasharray="4,3"/>
  <circle cx="60" cy="74" r="28" fill="none" stroke="#00BCD4" stroke-width="1.5" stroke-dasharray="2,3"/>

  <!-- Golden Diya (Oil Lamp) -->
  <g>
    <!-- Diya Base Stem -->
    <path d="M 52 78 L 46 84 L 74 84 L 68 78 Z" fill="#FF8F00"/>
    <!-- Diya Body Bowl -->
    <path d="M 28 64 C 30 78 90 78 92 64 C 82 72 38 72 28 64 Z" fill="url(#diya_body)" stroke="#FFE082" stroke-width="1.5"/>
    <ellipse cx="60" cy="64" rx="30" ry="7" fill="#E65100"/>
    <ellipse cx="60" cy="64" rx="26" ry="5" fill="#BF360C"/>

    <!-- Radiant Flame -->
    <path d="M 60 22 C 48 38 52 56 60 58 C 68 56 72 38 60 22 Z" fill="url(#flame)" filter="url(#glow_f)"/>
    <ellipse cx="60" cy="48" rx="3.5" ry="7" fill="#FFFFFF" opacity="0.9"/>
  </g>

  <!-- Sparkles -->
  <polygon points="28,32 30,36 34,36 31,39 32,43 28,40 24,43 25,39 22,36 26,36" fill="#FFD700"/>
  <polygon points="92,32 94,36 98,36 95,39 96,43 92,40 88,43 89,39 86,36 90,36" fill="#FFD700"/>
  <polygon points="60,12 61,15 64,15 62,17 63,20 60,18 57,20 58,17 56,15 59,15" fill="#FFF"/>

  <!-- Bottom Pill -->
  <rect x="22" y="90" width="76" height="18" rx="9" fill="#FF8F00"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5">HAPPY DIWALI</text>
</svg>
"""

# 5. Gujarati New Year / Bestu Varas: Sacred Kalash with Coconut & Mango leaves
svgs["new_year.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_ny" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF9C4"/>
      <stop offset="60%" stop-color="#FFF176"/>
      <stop offset="100%" stop-color="#FBC02D"/>
    </radialGradient>
    <linearGradient id="kalash_g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="50%" stop-color="#FFA000"/>
      <stop offset="100%" stop-color="#FF6F00"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_ny)" stroke="#F57F17" stroke-width="2.5"/>

  <!-- Mango Leaves (Amra Pallav) -->
  <g transform="translate(60, 48)">
    <path d="M 0 0 C -12 -18 -30 -12 -28 -4 C -20 0 -10 2 0 0 Z" fill="#2E7D32"/>
    <path d="M 0 0 C 12 -18 30 -12 28 -4 C 20 0 10 2 0 0 Z" fill="#2E7D32"/>
    <path d="M 0 0 C -8 -22 -15 -24 -12 -28 C -6 -28 0 -18 0 0 Z" fill="#388E3C"/>
    <path d="M 0 0 C 8 -22 15 -24 12 -28 C 6 -28 0 -18 0 0 Z" fill="#388E3C"/>
    <path d="M 0 0 C -4 -28 4 -28 0 0 Z" fill="#4CAF50"/>
    <!-- Coconut (Nariyal / Shriphal) -->
    <ellipse cx="0" cy="-14" rx="11" ry="14" fill="#6D4C41" stroke="#3E2723" stroke-width="1.5"/>
    <circle cx="0" cy="-24" r="2.5" fill="#D32F2F"/>
  </g>

  <!-- Golden Kalash Pot -->
  <g>
    <!-- Rim -->
    <ellipse cx="60" cy="50" rx="20" ry="5" fill="#FFD54F" stroke="#E65100" stroke-width="1.5"/>
    <!-- Pot Body -->
    <path d="M 42 52 C 34 60 36 78 48 83 L 72 83 C 84 78 86 60 78 52 Z" fill="url(#kalash_g)" stroke="#E65100" stroke-width="1.5"/>
    <!-- Base -->
    <ellipse cx="60" cy="83" rx="14" ry="3.5" fill="#FFB300" stroke="#E65100" stroke-width="1.5"/>
    <!-- Auspicious Swastik on Kalash -->
    <g transform="translate(60, 68)" stroke="#D50000" stroke-width="2.5" stroke-linecap="square">
      <line x1="0" y1="-8" x2="0" y2="8"/>
      <line x1="-8" y1="0" x2="8" y2="0"/>
      <line x1="0" y1="-8" x2="6" y2="-8"/>
      <line x1="0" y1="8" x2="-6" y2="8"/>
      <line x1="-8" y1="0" x2="-8" y2="-6"/>
      <line x1="8" y1="0" x2="8" y2="6"/>
      <circle cx="-4" cy="-4" r="1" fill="#D50000"/>
      <circle cx="4" cy="-4" r="1" fill="#D50000"/>
      <circle cx="-4" cy="4" r="1" fill="#D50000"/>
      <circle cx="4" cy="4" r="1" fill="#D50000"/>
    </g>
  </g>

  <!-- Bottom Pill -->
  <rect x="20" y="90" width="80" height="18" rx="9" fill="#D84315"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8" fill="#FFFFFF" letter-spacing="0.5">BESTU VARAS</text>
</svg>
"""

# 6. Bhai Dooj: Pooja Thali with Tilak, Diya & Sweets
svgs["bhai_dooj.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_bd" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCE4EC"/>
      <stop offset="60%" stop-color="#F8BBD0"/>
      <stop offset="100%" stop-color="#F48FB1"/>
    </radialGradient>
    <radialGradient id="thali" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ECEFF1"/>
      <stop offset="70%" stop-color="#CFD8DC"/>
      <stop offset="100%" stop-color="#B0BEC5"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_bd)" stroke="#D81B60" stroke-width="2.5"/>

  <!-- Silver Thali (Plate) -->
  <circle cx="60" cy="54" r="34" fill="url(#thali)" stroke="#78909C" stroke-width="3"/>
  <circle cx="60" cy="54" r="28" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="3,3"/>

  <!-- Roli Katori (Red Vermilion Tilak) -->
  <circle cx="46" cy="45" r="9" fill="#D50000" stroke="#FFD54F" stroke-width="1.5"/>
  <circle cx="46" cy="45" r="4" fill="#B71C1C"/>

  <!-- Akshat Katori (Rice grains) -->
  <circle cx="74" cy="45" r="9" fill="#FFFDE7" stroke="#FFD54F" stroke-width="1.5"/>
  <ellipse cx="73" cy="44" rx="2" ry="3" fill="#E0E0E0"/>
  <ellipse cx="76" cy="46" rx="2" ry="3" fill="#E0E0E0"/>

  <!-- Small Diya in Thali -->
  <g transform="translate(60, 64)">
    <ellipse cx="0" cy="0" rx="10" ry="4" fill="#FF8F00"/>
    <path d="M 0 -10 C -4 -4 -3 0 0 0 C 3 0 4 -4 0 -10 Z" fill="#FFEB3B"/>
  </g>

  <!-- Sweet / Mithai (Kaju Katli diamond) -->
  <polygon points="60,34 68,40 60,46 52,40" fill="#EEEEEE" stroke="#BDBDBD" stroke-width="1"/>
  <!-- Silver vark -->
  <polygon points="59,36 65,40 59,44 54,40" fill="#FAFAFA"/>

  <!-- Bottom Pill -->
  <rect x="22" y="90" width="76" height="18" rx="9" fill="#AD1457"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5">BHAI DOOJ</text>
</svg>
"""

# 7. Makar Sankranti / Uttarayan: Vibrant Kites & Firki
svgs["uttarayan.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="sky_grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E1F5FE"/>
      <stop offset="60%" stop-color="#81D4FA"/>
      <stop offset="100%" stop-color="#29B6F6"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#sky_grad)" stroke="#0288D1" stroke-width="2.5"/>

  <!-- Sun in corner -->
  <circle cx="92" cy="28" r="12" fill="#FFEE58"/>
  <circle cx="92" cy="28" r="16" fill="#FFF59D" opacity="0.4"/>

  <!-- Main Colorful Kite (Patang) -->
  <g transform="translate(48, 42) rotate(-15)">
    <!-- Kite Body Diamond -->
    <polygon points="0,-22 22,0 0,22 -22,0" fill="#FF5722"/>
    <polygon points="0,-22 22,0 0,0" fill="#FFEB3B"/>
    <polygon points="0,0 -22,0 0,22" fill="#4CAF50"/>
    <!-- Spine Bamboo Stick -->
    <line x1="0" y1="-22" x2="0" y2="22" stroke="#424242" stroke-width="1.2"/>
    <!-- Curved Cross Bow Stick -->
    <path d="M -22 0 Q 0 -14 22 0" fill="none" stroke="#424242" stroke-width="1.2"/>
    <!-- Kite Tail (Puchhi) -->
    <polygon points="0,22 -6,30 6,30" fill="#E91E63"/>
    <!-- Thread (Manja) -->
    <path d="M 0 5 Q 12 25 22 45" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-dasharray="2,2"/>
  </g>

  <!-- Small background Kite -->
  <g transform="translate(84, 52) rotate(20) scale(0.55)">
    <polygon points="0,-20 20,0 0,20 -20,0" fill="#9C27B0"/>
    <polygon points="0,-20 20,0 0,0" fill="#00E676"/>
    <polygon points="0,20 -6,28 6,28" fill="#FFD600"/>
  </g>

  <!-- String Spool (Firki) -->
  <g transform="translate(76, 75) rotate(-35)">
    <rect x="-10" y="-14" width="20" height="28" rx="2" fill="#D32F2F"/>
    <!-- Thread coils -->
    <line x1="-10" y1="-8" x2="10" y2="-8" stroke="#FFEB3B" stroke-width="1.5"/>
    <line x1="-10" y1="-4" x2="10" y2="-4" stroke="#FFEB3B" stroke-width="1.5"/>
    <line x1="-10" y1="0" x2="10" y2="0" stroke="#FFEB3B" stroke-width="1.5"/>
    <line x1="-10" y1="4" x2="10" y2="4" stroke="#FFEB3B" stroke-width="1.5"/>
    <line x1="-10" y1="8" x2="10" y2="8" stroke="#FFEB3B" stroke-width="1.5"/>
    <!-- Wooden handles -->
    <line x1="0" y1="-20" x2="0" y2="20" stroke="#8D6E63" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Bottom Pill -->
  <rect x="22" y="90" width="76" height="18" rx="9" fill="#0277BD"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5">UTTARAYAN</text>
</svg>
"""

# 8. Republic Day: Indian Flag Tricolor & Ashoka Chakra
svgs["republic_day.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_rep" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFF3E0"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E8F5E9"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_rep)" stroke="#FF9933" stroke-width="2.5"/>

  <!-- Tricolor Waving Ribbons -->
  <path d="M 22 40 C 40 32 50 48 70 40 C 85 34 92 40 98 42 L 98 52 C 85 48 75 56 60 54 C 42 50 30 56 22 52 Z" fill="#FF9933"/>
  <path d="M 22 52 C 35 56 45 50 60 54 C 75 58 85 48 98 52 L 98 62 C 85 58 75 66 60 64 C 42 60 30 66 22 62 Z" fill="#FFFFFF" stroke="#ECEFF1" stroke-width="0.5"/>
  <path d="M 22 62 C 35 66 45 60 60 64 C 75 68 85 58 98 62 L 98 72 C 85 68 75 76 60 74 C 42 70 30 76 22 72 Z" fill="#138808"/>

  <!-- Ashoka Chakra (24 Spokes) -->
  <g transform="translate(60, 57)">
    <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#000080" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="2.5" fill="#000080"/>
    <!-- 8 spokes represented cleanly -->
    <line x1="0" y1="-11" x2="0" y2="11" stroke="#000080" stroke-width="0.8"/>
    <line x1="-11" y1="0" x2="11" y2="0" stroke="#000080" stroke-width="0.8"/>
    <line x1="-7.8" y1="-7.8" x2="7.8" y2="7.8" stroke="#000080" stroke-width="0.8"/>
    <line x1="-7.8" y1="7.8" x2="7.8" y2="-7.8" stroke="#000080" stroke-width="0.8"/>
    <line x1="-4.2" y1="-10.1" x2="4.2" y2="10.1" stroke="#000080" stroke-width="0.8"/>
    <line x1="4.2" y1="-10.1" x2="-4.2" y2="10.1" stroke="#000080" stroke-width="0.8"/>
    <line x1="-10.1" y1="-4.2" x2="10.1" y2="4.2" stroke="#000080" stroke-width="0.8"/>
    <line x1="10.1" y1="-4.2" x2="-10.1" y2="4.2" stroke="#000080" stroke-width="0.8"/>
  </g>

  <!-- Bottom Pill -->
  <rect x="20" y="90" width="80" height="18" rx="9" fill="#0D47A1"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8" fill="#FFFFFF" letter-spacing="0.5">REPUBLIC DAY</text>
</svg>
"""

# 9. Holi: Water Pichkari splashing colorful Gulal
svgs["holi.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_holi" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="#FFF8E1"/>
      <stop offset="100%" stop-color="#FFE0B2"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_holi)" stroke="#FF4081" stroke-width="2.5"/>

  <!-- Splashes of Color (Gulal) -->
  <path d="M 24 35 C 28 20 45 25 50 35 C 55 42 42 50 35 48 C 25 45 20 42 24 35 Z" fill="#E91E63" opacity="0.85"/>
  <path d="M 72 25 C 85 20 95 35 90 45 C 85 52 75 48 72 40 Z" fill="#00BCD4" opacity="0.85"/>
  <path d="M 75 60 C 90 62 98 75 88 82 C 78 88 70 78 75 60 Z" fill="#FFEB3B" opacity="0.85"/>
  <path d="M 26 65 C 18 72 25 85 36 82 C 45 80 40 70 30 68 Z" fill="#7C4DFF" opacity="0.85"/>

  <!-- Pichkari (Water Gun) -->
  <g transform="translate(60, 52) rotate(-35)">
    <!-- Barrel -->
    <rect x="-6" y="-22" width="12" height="44" rx="4" fill="#FF9800" stroke="#E65100" stroke-width="1.5"/>
    <!-- Rings -->
    <rect x="-7" y="-12" width="14" height="4" fill="#FFEB3B"/>
    <rect x="-7" y="2" width="14" height="4" fill="#00E676"/>
    <!-- Nozzle -->
    <polygon points="0,-32 -4,-22 4,-22" fill="#D50000"/>
    <!-- Plunger rod & handle -->
    <rect x="-2" y="22" width="4" height="12" fill="#78909C"/>
    <ellipse cx="0" cy="34" rx="7" ry="3" fill="#37474F"/>
    <!-- Jet spray -->
    <circle cx="0" cy="-36" r="3" fill="#00E5FF"/>
    <circle cx="-5" cy="-42" r="2.5" fill="#E040FB"/>
    <circle cx="5" cy="-44" r="2.5" fill="#FFEA00"/>
  </g>

  <!-- Bottom Pill -->
  <rect x="22" y="90" width="76" height="18" rx="9" fill="#E91E63"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5">HAPPY HOLI</text>
</svg>
"""

# 10. Eid-ul-Fitr: Golden Crescent Moon, Fanous Lantern & Mosque
svgs["eid.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_eid" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#004D40"/>
      <stop offset="60%" stop-color="#00251A"/>
      <stop offset="100%" stop-color="#00150F"/>
    </radialGradient>
    <linearGradient id="moon_g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4"/>
      <stop offset="50%" stop-color="#FFD54F"/>
      <stop offset="100%" stop-color="#FFB300"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_eid)" stroke="#FFD54F" stroke-width="2.5"/>

  <!-- Golden Crescent Moon -->
  <g transform="translate(56, 46)">
    <path d="M 0 -26 A 28 28 0 1 1 -24 16 A 22 22 0 1 0 0 -26 Z" fill="url(#moon_g)"/>
    <!-- Star next to Crescent -->
    <polygon points="12,-10 14,-5 19,-5 15,-2 17,3 12,0 8,3 9,-2 6,-5 10,-5" fill="#FFFDE7"/>
  </g>

  <!-- Hanging Fanous (Ornamental Lantern) -->
  <g transform="translate(86, 26)">
    <line x1="0" y1="0" x2="0" y2="14" stroke="#FFD54F" stroke-width="1"/>
    <!-- Lantern Cap -->
    <polygon points="0,14 -5,18 5,18" fill="#FFA000"/>
    <!-- Glass Body -->
    <rect x="-4" y="18" width="8" height="12" fill="#FFE082" stroke="#FF8F00" stroke-width="1"/>
    <circle cx="0" cy="24" r="2" fill="#FFFFFF"/>
    <!-- Bottom Cone -->
    <polygon points="-4,30 4,30 0,35" fill="#FFA000"/>
  </g>

  <!-- Mosque Dome Silhouette -->
  <path d="M 25 84 L 25 76 Q 30 76 30 72 Q 35 60 45 60 Q 55 60 60 72 Q 60 76 65 76 L 95 76 L 95 84 Z" fill="#00332C" opacity="0.8"/>

  <!-- Bottom Pill -->
  <rect x="22" y="90" width="76" height="18" rx="9" fill="#00796B"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5">EID MUBARAK</text>
</svg>
"""

# 11. Dr. B.R. Ambedkar Jayanti: Constitution Book & Ashoka Pillar / Blue Theme
svgs["ambedkar_jayanti.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_amb" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E3F2FD"/>
      <stop offset="60%" stop-color="#BBDEFB"/>
      <stop offset="100%" stop-color="#90CAF9"/>
    </radialGradient>
    <linearGradient id="book_cover" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1565C0"/>
      <stop offset="100%" stop-color="#0D47A1"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_amb)" stroke="#1976D2" stroke-width="2.5"/>

  <!-- Ashoka Chakra Aura behind Book -->
  <circle cx="60" cy="52" r="28" fill="none" stroke="#1565C0" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6"/>

  <!-- The Constitution of India Book (Samvidhan) -->
  <g transform="translate(60, 52)">
    <!-- Book 3D spine/pages -->
    <rect x="-24" y="-22" width="48" height="36" rx="3" fill="url(#book_cover)" stroke="#FFD54F" stroke-width="1.5"/>
    <rect x="-21" y="-20" width="42" height="32" rx="2" fill="#0D47A1"/>
    <!-- Golden Border on Book -->
    <rect x="-19" y="-18" width="38" height="28" rx="1.5" fill="none" stroke="#FFD54F" stroke-width="1"/>
    <!-- Ashoka Stambh Emblem on Book -->
    <circle cx="0" cy="-6" r="6" fill="none" stroke="#FFD54F" stroke-width="1.2"/>
    <line x1="0" y1="-10" x2="0" y2="-2" stroke="#FFD54F" stroke-width="1"/>
    <line x1="-4" y1="-6" x2="4" y2="-6" stroke="#FFD54F" stroke-width="1"/>
    <text x="0" y="5" text-anchor="middle" font-family="serif" font-weight="bold" font-size="4" fill="#FFD54F">CONSTITUTION</text>
    <text x="0" y="8" text-anchor="middle" font-family="serif" font-weight="bold" font-size="3" fill="#FFD54F">OF INDIA</text>
  </g>

  <!-- Classic Glasses / Spectacles below book -->
  <g transform="translate(60, 77)">
    <circle cx="-10" cy="0" r="7" fill="#FFFFFF" stroke="#0D47A1" stroke-width="2"/>
    <circle cx="10" cy="0" r="7" fill="#FFFFFF" stroke="#0D47A1" stroke-width="2"/>
    <path d="M -3 -1 Q 0 -4 3 -1" fill="none" stroke="#0D47A1" stroke-width="2"/>
  </g>

  <!-- Bottom Pill -->
  <rect x="18" y="90" width="84" height="18" rx="9" fill="#0D47A1"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="7.5" fill="#FFFFFF" letter-spacing="0.5">AMBEDKAR JAYANTI</text>
</svg>
"""

# 12. Independence Day: Indian National Flag & Flying Dove
svgs["independence_day.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_ind" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E8F5E9"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#FFF3E0"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_ind)" stroke="#138808" stroke-width="2.5"/>

  <!-- Flagpole -->
  <line x1="36" y1="20" x2="36" y2="86" stroke="#5D4037" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="36" cy="19" r="3.5" fill="#FFD54F"/>

  <!-- Proud Waving Indian Flag -->
  <g transform="translate(36, 22)">
    <!-- Saffron Band -->
    <path d="M 0 0 C 14 -4 28 4 44 0 L 44 12 C 28 16 14 8 0 12 Z" fill="#FF9933"/>
    <!-- White Band -->
    <path d="M 0 12 C 14 8 28 16 44 12 L 44 24 C 28 28 14 20 0 24 Z" fill="#FFFFFF" stroke="#ECEFF1" stroke-width="0.5"/>
    <!-- Green Band -->
    <path d="M 0 24 C 14 20 28 28 44 24 L 44 36 C 28 40 14 32 0 36 Z" fill="#138808"/>
    <!-- Ashoka Chakra on White Band -->
    <circle cx="22" cy="18" r="4.5" fill="none" stroke="#000080" stroke-width="1"/>
    <circle cx="22" cy="18" r="1" fill="#000080"/>
    <line x1="22" y1="13.5" x2="22" y2="22.5" stroke="#000080" stroke-width="0.6"/>
    <line x1="17.5" y1="18" x2="26.5" y2="18" stroke="#000080" stroke-width="0.6"/>
  </g>

  <!-- Flying Peace Bird / Dove -->
  <path d="M 82 24 C 86 18 94 20 96 24 C 92 24 90 28 86 28 C 84 28 82 26 82 24 Z" fill="#90CAF9"/>

  <!-- Bottom Pill -->
  <rect x="16" y="90" width="88" height="18" rx="9" fill="#1B5E20"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="7.5" fill="#FFFFFF" letter-spacing="0.5">INDEPENDENCE DAY</text>
</svg>
"""

# 13. Raksha Bandhan: Traditional Golden Rakhi with Silk Threads
svgs["raksha_bandhan.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_rak" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF8E1"/>
      <stop offset="60%" stop-color="#FFECB3"/>
      <stop offset="100%" stop-color="#FFE082"/>
    </radialGradient>
    <radialGradient id="rakhi_center" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFD54F"/>
      <stop offset="60%" stop-color="#FF6F00"/>
      <stop offset="100%" stop-color="#D50000"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_rak)" stroke="#E65100" stroke-width="2.5"/>

  <!-- Rakhi Red/Yellow Silk Thread extending outwards -->
  <path d="M 16 56 Q 38 62 60 56 Q 82 50 104 56" fill="none" stroke="#D50000" stroke-width="3" stroke-linecap="round"/>
  <path d="M 16 58 Q 38 64 60 58 Q 82 52 104 58" fill="none" stroke="#FFD54F" stroke-width="2" stroke-linecap="round"/>

  <!-- Pearls / Beads on Thread -->
  <circle cx="34" cy="59" r="3.5" fill="#FFFDE7" stroke="#FFA000" stroke-width="1"/>
  <circle cx="42" cy="58" r="3.5" fill="#D50000"/>
  <circle cx="78" cy="55" r="3.5" fill="#D50000"/>
  <circle cx="86" cy="54" r="3.5" fill="#FFFDE7" stroke="#FFA000" stroke-width="1"/>

  <!-- Ornate Rakhi Centerpiece (Floral Chakra) -->
  <g transform="translate(60, 56)">
    <!-- Outer Petals -->
    <circle cx="0" cy="0" r="22" fill="#D50000" stroke="#FFD54F" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="18" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="2,3"/>
    <!-- Golden Core -->
    <circle cx="0" cy="0" r="14" fill="url(#rakhi_center)" stroke="#FFD700" stroke-width="2"/>
    <!-- Center Jewel (Kundan / Gem) -->
    <polygon points="0,-8 6,-3 6,5 0,9 -6,5 -6,-3" fill="#00E5FF" stroke="#FFFFFF" stroke-width="1"/>
    <circle cx="0" cy="0" r="3" fill="#FFFFFF"/>
  </g>

  <!-- Bottom Pill -->
  <rect x="18" y="90" width="84" height="18" rx="9" fill="#C2185B"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="7.5" fill="#FFFFFF" letter-spacing="0.5">RAKSHA BANDHAN</text>
</svg>
"""

# 14. Janmashtami: Lord Krishna's Bansuri (Flute), Mor Pankh (Peacock Feather) & Makhan Matki
svgs["janmashtami.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_jan" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E1F5FE"/>
      <stop offset="60%" stop-color="#B3E5FC"/>
      <stop offset="100%" stop-color="#4FC3F7"/>
    </radialGradient>
    <linearGradient id="feather_g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00C853"/>
      <stop offset="50%" stop-color="#0091EA"/>
      <stop offset="100%" stop-color="#304FFE"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_jan)" stroke="#0277BD" stroke-width="2.5"/>

  <!-- Mor Pankh (Peacock Feather) -->
  <g transform="translate(68, 38) rotate(25)">
    <path d="M 0 -24 C -14 -12 -14 12 0 24 C 14 12 14 -12 0 -24 Z" fill="url(#feather_g)" stroke="#FFD54F" stroke-width="1"/>
    <!-- Inner Eye -->
    <ellipse cx="0" cy="0" rx="7" ry="10" fill="#00B0FF"/>
    <ellipse cx="0" cy="0" rx="4" ry="6" fill="#1A237E"/>
    <circle cx="0" cy="0" r="2.5" fill="#FFD54F"/>
    <!-- Feather spine -->
    <line x1="0" y1="-24" x2="0" y2="30" stroke="#FFD54F" stroke-width="1.2"/>
  </g>

  <!-- Golden Bansuri (Flute) -->
  <g transform="translate(54, 55) rotate(-22)">
    <rect x="-35" y="-3.5" width="70" height="7" rx="3.5" fill="#FFB300" stroke="#E65100" stroke-width="1.2"/>
    <!-- Tone holes -->
    <circle cx="-16" cy="0" r="1.5" fill="#3E2723"/>
    <circle cx="-8" cy="0" r="1.5" fill="#3E2723"/>
    <circle cx="0" cy="0" r="1.5" fill="#3E2723"/>
    <circle cx="8" cy="0" r="1.5" fill="#3E2723"/>
    <circle cx="16" cy="0" r="1.5" fill="#3E2723"/>
    <!-- Hanging Ghungroos / Tassels -->
    <path d="M 30 2 Q 33 14 36 22" fill="none" stroke="#D50000" stroke-width="1.2"/>
    <circle cx="36" cy="22" r="2.5" fill="#FFD54F"/>
  </g>

  <!-- Makhan Matki (Clay butter pot) -->
  <g transform="translate(36, 72)">
    <ellipse cx="0" cy="0" rx="14" ry="11" fill="#8D6E63" stroke="#5D4037" stroke-width="1.5"/>
    <!-- White Butter overflowing -->
    <ellipse cx="0" cy="-7" rx="10" ry="4" fill="#FFFFFF"/>
    <path d="M -5 -6 Q -2 3 0 0 Q 3 4 5 -6 Z" fill="#FFFFFF"/>
  </g>

  <!-- Bottom Pill -->
  <rect x="20" y="90" width="80" height="18" rx="9" fill="#0277BD"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8" fill="#FFFFFF" letter-spacing="0.5">JANMASHTAMI</text>
</svg>
"""

# 15. Christmas Day: Decorated Christmas Tree & Star
svgs["christmas.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_xmas" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E8F5E9"/>
      <stop offset="60%" stop-color="#C8E6C9"/>
      <stop offset="100%" stop-color="#A5D6A7"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_xmas)" stroke="#2E7D32" stroke-width="2.5"/>

  <!-- Christmas Tree Layers -->
  <g transform="translate(60, 52)">
    <!-- Tree Trunk -->
    <rect x="-6" y="24" width="12" height="12" rx="1" fill="#5D4037"/>

    <!-- Bottom Pine Tier -->
    <polygon points="0,6 -32,26 32,26" fill="#1B5E20"/>
    <!-- Middle Pine Tier -->
    <polygon points="0,-10 -24,8 24,8" fill="#2E7D32"/>
    <!-- Top Pine Tier -->
    <polygon points="0,-24 -16,-6 16,-6" fill="#388E3C"/>

    <!-- Baubles / Ornaments -->
    <circle cx="-12" cy="18" r="3" fill="#D50000"/>
    <circle cx="14" cy="19" r="3" fill="#FFD54F"/>
    <circle cx="0" cy="12" r="3" fill="#00E5FF"/>
    <circle cx="-8" cy="0" r="2.5" fill="#FFD54F"/>
    <circle cx="10" cy="2" r="2.5" fill="#D50000"/>
    <circle cx="0" cy="-14" r="2" fill="#FF4081"/>

    <!-- Glowing Top Star -->
    <polygon points="0,-32 2,-27 7,-27 3,-24 5,-19 0,-22 -5,-19 -3,-24 -7,-27 -2,-27" fill="#FFD700" stroke="#FF6F00" stroke-width="0.8"/>
  </g>

  <!-- Gift Box -->
  <g transform="translate(80, 78)">
    <rect x="-7" y="-7" width="14" height="14" rx="1.5" fill="#D50000"/>
    <!-- Ribbon -->
    <line x1="0" y1="-7" x2="0" y2="7" stroke="#FFD54F" stroke-width="2.5"/>
    <line x1="-7" y1="0" x2="7" y2="0" stroke="#FFD54F" stroke-width="2.5"/>
  </g>

  <!-- Bottom Pill -->
  <rect x="22" y="90" width="76" height="18" rx="9" fill="#B71C1C"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5">CHRISTMAS</text>
</svg>
"""

# 16. Default Festival Celebration: Festive Diya & Starburst
svgs["festival.svg"] = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <radialGradient id="bg_fest" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF3E0"/>
      <stop offset="60%" stop-color="#FFE082"/>
      <stop offset="100%" stop-color="#FFB300"/>
    </radialGradient>
    <linearGradient id="fest_flame" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FF5722"/>
      <stop offset="60%" stop-color="#FFEB3B"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <circle cx="60" cy="60" r="54" fill="url(#bg_fest)" stroke="#FF8F00" stroke-width="2.5"/>

  <!-- Decorative Garland / Toran Arc -->
  <path d="M 22 36 Q 40 46 60 40 Q 80 46 98 36" fill="none" stroke="#D84315" stroke-width="2"/>
  <circle cx="40" cy="42" r="3" fill="#D50000"/>
  <circle cx="60" cy="40" r="3" fill="#4CAF50"/>
  <circle cx="80" cy="42" r="3" fill="#D50000"/>

  <!-- Golden Diya -->
  <g transform="translate(60, 64)">
    <path d="M -24 0 C -22 14 22 14 24 0 C 16 6 -16 6 -24 0 Z" fill="#E65100" stroke="#FFD54F" stroke-width="1.5"/>
    <ellipse cx="0" cy="0" rx="22" ry="4" fill="#BF360C"/>
    <!-- Flame -->
    <path d="M 0 -26 C -8 -14 -6 0 0 0 C 6 0 8 -14 0 -26 Z" fill="url(#fest_flame)"/>
    <ellipse cx="0" cy="-8" rx="2" ry="5" fill="#FFFFFF"/>
  </g>

  <!-- Sparkles -->
  <polygon points="30,22 32,25 35,25 33,27 34,30 30,28 26,30 27,27 25,25 28,25" fill="#FFD700"/>
  <polygon points="90,22 92,25 95,25 93,27 94,30 90,28 86,30 87,27 85,25 88,25" fill="#FFD700"/>

  <!-- Bottom Pill -->
  <rect x="22" y="90" width="76" height="18" rx="9" fill="#E65100"/>
  <text x="60" y="103" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="0.5">FESTIVAL DAY</text>
</svg>
"""

# Write all SVGs
for filename, content in svgs.items():
    path = os.path.join(dest_dir, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Generated {filename}")

print(f"Total {len(svgs)} festival SVGs created successfully in {dest_dir}")
