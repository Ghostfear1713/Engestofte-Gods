// Mirrors backend pricing.py — keep in sync

export function calculatePrice(service, details) {
  const guests = parseInt(details.guests) || 0

  if (service === 'wedding') {
    const venue = details.venue || 'barn'
    const venueCost = venue === 'barn' ? 16900 : 3375
    const perPerson = venue === 'barn' ? 1495 : 475
    const extraCourse = details.extra_course ? 225 : 0
    return {
      total: venueCost + (perPerson + extraCourse) * guests,
      breakdown: [
        { label: venue === 'barn' ? 'Leje af Den Gamle Lade' : 'Leje af Værkstedet', amount: venueCost },
        { label: `Bryllupsmenu (${perPerson} kr./pers. × ${guests})`, amount: perPerson * guests },
        ...(extraCourse ? [{ label: `Ekstra ret (+225 kr./pers. × ${guests})`, amount: extraCourse * guests }] : []),
      ],
      priceOnRequest: false,
    }
  }

  if (service === 'party') {
    const venue = details.venue || 'barn'
    const venueCost = venue === 'barn' ? 16900 : 3375
    const perPerson = venue === 'barn' ? 1125 : 1075
    const smallGroupSurcharge = guests > 0 && guests < 60 ? 115 * guests : 0
    const extraCourse = details.extra_course ? 225 * guests : 0
    return {
      total: venueCost + perPerson * guests + smallGroupSurcharge + extraCourse,
      breakdown: [
        { label: venue === 'barn' ? 'Leje af Den Gamle Lade' : 'Leje af Værkstedet', amount: venueCost },
        { label: `Festmenu (${perPerson} kr./pers. × ${guests})`, amount: perPerson * guests },
        ...(smallGroupSurcharge ? [{ label: `Tillæg under 60 gæster (115 kr./pers.)`, amount: smallGroupSurcharge }] : []),
        ...(extraCourse ? [{ label: `Ekstra ret (+225 kr./pers. × ${guests})`, amount: extraCourse }] : []),
      ],
      priceOnRequest: false,
    }
  }

  if (service === 'conference') {
    const pkg = details.package || 'full_day'
    const rates = { full_day: 665, extended: 1199, evening: 1199 }
    const perPerson = rates[pkg]
    const smallGroupSurcharge = guests > 0 && guests < 100 ? 100 * guests : 0
    return {
      total: perPerson * guests + smallGroupSurcharge,
      breakdown: [
        { label: `Konferencepakke (${perPerson} kr./pers. × ${guests})`, amount: perPerson * guests },
        ...(smallGroupSurcharge ? [{ label: `Tillæg under 100 deltagere (100 kr./pers.)`, amount: smallGroupSurcharge }] : []),
      ],
      priceOnRequest: false,
    }
  }

  if (service === 'hunting') {
    const birds = Math.max(parseInt(details.birds) || 150, 150)
    return {
      total: 420 * birds,
      breakdown: [
        { label: `Fasanjagt (420 kr./fugl × ${birds} fugle)`, amount: 420 * birds },
      ],
      priceOnRequest: false,
    }
  }

  // summer_house — price on request
  return { total: null, breakdown: [], priceOnRequest: true }
}

export function formatDKK(amount) {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const STAFF = {
  wedding:      { name: 'Johan Borup Jensen', email: 'jj@engestofte.dk', phone: '+45 31 37 54 59' },
  party:        { name: 'Johan Borup Jensen', email: 'jj@engestofte.dk', phone: '+45 31 37 54 59' },
  conference:   { name: 'Johan Borup Jensen', email: 'jj@engestofte.dk', phone: '+45 31 37 54 59' },
  hunting:      { name: 'Lise Egeskov',       email: 'le@engestofte.dk', phone: '+45 26 80 61 69' },
  summer_house: { name: 'Lise Egeskov',       email: 'le@engestofte.dk', phone: '+45 26 80 61 69' },
  other:        { name: 'Mette Egeskov',      email: 'me@engestofte.dk', phone: '+45 26 22 04 04' },
}
