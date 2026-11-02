// Utility for mapping festival and holiday names to their official illustration images and visual tags

export const getFestivalDetails = (holidayName) => {
  if (!holidayName) {
    return {
      image: '/festivals/festival.svg',
      title: 'Festival Day Off',
      shortTitle: 'Festival',
      tag: 'Office Closed',
      theme: 'from-amber-50 to-yellow-50 border-amber-300'
    };
  }

  const lower = holidayName.toLowerCase();

  // 1. Mahatma Gandhi Jayanti
  if (lower.includes('gandhi')) {
    return {
      image: '/festivals/gandhi_jayanti.svg',
      title: 'Mahatma Gandhi Jayanti',
      shortTitle: 'Gandhi Jayanti',
      tag: 'National Holiday',
      theme: 'from-amber-50 to-emerald-50 border-amber-300 text-amber-950'
    };
  }

  // 2. Maha Navami / Navratri
  if (lower.includes('navami') || lower.includes('navratri')) {
    return {
      image: '/festivals/navratri.svg',
      title: 'Maha Navami (Navratri)',
      shortTitle: 'Maha Navami',
      tag: 'Navratri Festival',
      theme: 'from-amber-50 to-rose-50 border-rose-300 text-rose-950'
    };
  }

  // 3. Dussehra / Vijayadashami
  if (lower.includes('dussehra') || lower.includes('vijayadashami') || lower.includes('vijaya dashami')) {
    return {
      image: '/festivals/dussehra.svg',
      title: 'Dussehra / Vijayadashami',
      shortTitle: 'Dussehra',
      tag: 'Victory Festival',
      theme: 'from-orange-50 to-amber-50 border-orange-300 text-orange-950'
    };
  }

  // 4. Diwali / Deepawali
  if (lower.includes('diwali') || lower.includes('deepawali') || lower.includes('deepavali')) {
    return {
      image: '/festivals/diwali.svg',
      title: 'Diwali / Deepawali',
      shortTitle: 'Happy Diwali',
      tag: 'Festival of Lights',
      theme: 'from-amber-50 to-yellow-50 border-amber-400 text-amber-950'
    };
  }

  // 5. Gujarati New Year / Bestu Varas
  if (lower.includes('new year') || lower.includes('bestu') || lower.includes('varas')) {
    return {
      image: '/festivals/new_year.svg',
      title: 'Gujarati New Year (Bestu Varas)',
      shortTitle: 'Bestu Varas',
      tag: 'New Year',
      theme: 'from-yellow-50 to-amber-50 border-amber-300 text-amber-950'
    };
  }

  // 6. Bhai Dooj / Bhai Bij
  if (lower.includes('bhai dooj') || lower.includes('bhaidooj') || lower.includes('bhai bij')) {
    return {
      image: '/festivals/bhai_dooj.svg',
      title: 'Bhai Dooj',
      shortTitle: 'Bhai Dooj',
      tag: 'Festival Celebration',
      theme: 'from-pink-50 to-rose-50 border-pink-300 text-pink-950'
    };
  }

  // 7. Makar Sankranti / Uttarayan
  if (lower.includes('uttarayan') || lower.includes('sankranti') || lower.includes('patang')) {
    return {
      image: '/festivals/uttarayan.svg',
      title: 'Makar Sankranti / Uttarayan',
      shortTitle: 'Uttarayan',
      tag: 'Kite Festival',
      theme: 'from-sky-50 to-blue-50 border-sky-300 text-sky-950'
    };
  }

  // 8. Republic Day
  if (lower.includes('republic')) {
    return {
      image: '/festivals/republic_day.svg',
      title: 'Republic Day',
      shortTitle: 'Republic Day',
      tag: 'National Holiday',
      theme: 'from-orange-50 via-white to-emerald-50 border-orange-300 text-slate-900'
    };
  }

  // 9. Holi / Dhuleti
  if (lower.includes('holi') || lower.includes('dhuleti')) {
    return {
      image: '/festivals/holi.svg',
      title: 'Holi / Dhuleti',
      shortTitle: 'Happy Holi',
      tag: 'Festival of Colors',
      theme: 'from-pink-50 to-yellow-50 border-pink-300 text-pink-950'
    };
  }

  // 10. Eid-ul-Fitr
  if (lower.includes('eid')) {
    return {
      image: '/festivals/eid.svg',
      title: 'Eid-ul-Fitr',
      shortTitle: 'Eid Mubarak',
      tag: 'Festival Celebration',
      theme: 'from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950'
    };
  }

  // 11. Dr. B.R. Ambedkar Jayanti
  if (lower.includes('ambedkar')) {
    return {
      image: '/festivals/ambedkar_jayanti.svg',
      title: 'Dr. B.R. Ambedkar Jayanti',
      shortTitle: 'Ambedkar Jayanti',
      tag: 'National Holiday',
      theme: 'from-blue-50 to-indigo-50 border-blue-300 text-blue-950'
    };
  }

  // 12. Independence Day
  if (lower.includes('independence')) {
    return {
      image: '/festivals/independence_day.svg',
      title: 'Independence Day',
      shortTitle: 'Independence Day',
      tag: 'National Holiday',
      theme: 'from-orange-50 via-white to-emerald-50 border-emerald-300 text-slate-900'
    };
  }

  // 13. Raksha Bandhan
  if (lower.includes('raksha') || lower.includes('rakhi')) {
    return {
      image: '/festivals/raksha_bandhan.svg',
      title: 'Raksha Bandhan',
      shortTitle: 'Raksha Bandhan',
      tag: 'Festival Celebration',
      theme: 'from-rose-50 to-amber-50 border-rose-300 text-rose-950'
    };
  }

  // 14. Janmashtami / Krishna
  if (lower.includes('janmashtami') || lower.includes('krishna')) {
    return {
      image: '/festivals/janmashtami.svg',
      title: 'Janmashtami (Krishna Jayanti)',
      shortTitle: 'Janmashtami',
      tag: 'Festival Celebration',
      theme: 'from-sky-50 to-indigo-50 border-sky-300 text-sky-950'
    };
  }

  // 15. Christmas
  if (lower.includes('christmas') || lower.includes('xmas')) {
    return {
      image: '/festivals/christmas.svg',
      title: 'Christmas Day',
      shortTitle: 'Merry Christmas',
      tag: 'Holiday Celebration',
      theme: 'from-emerald-50 to-red-50 border-emerald-300 text-emerald-950'
    };
  }

  // Default Fallback
  return {
    image: '/festivals/festival.svg',
    title: holidayName,
    shortTitle: holidayName.length > 14 ? holidayName.slice(0, 12) + '...' : holidayName,
    tag: 'Festival Day Off',
    theme: 'from-amber-50 to-yellow-50 border-amber-300 text-amber-950'
  };
};
