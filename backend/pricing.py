def calculate(service, details):
    guests = int(details.get('guests') or 0)

    if service == 'wedding':
        venue = details.get('venue', 'barn')
        venue_cost = 16900 if venue == 'barn' else 3375
        per_person = 1495 if venue == 'barn' else 475
        if details.get('extra_course'):
            per_person += 225
        total = venue_cost + per_person * guests
        return {'total': total, 'price_on_request': False}

    if service == 'party':
        venue = details.get('venue', 'barn')
        venue_cost = 16900 if venue == 'barn' else 3375
        per_person = 1125 if venue == 'barn' else 1075
        surcharge = 115 * guests if 0 < guests < 60 else 0
        if details.get('extra_course'):
            per_person += 225
        total = venue_cost + per_person * guests + surcharge
        return {'total': total, 'price_on_request': False}

    if service == 'conference':
        rates = {'full_day': 665, 'extended': 1199, 'evening': 1199}
        per_person = rates.get(details.get('package', 'full_day'), 665)
        surcharge = 100 * guests if 0 < guests < 100 else 0
        total = per_person * guests + surcharge
        return {'total': total, 'price_on_request': False}

    if service == 'hunting':
        birds = max(int(details.get('birds') or 150), 150)
        total = 420 * birds
        return {'total': total, 'price_on_request': False}

    # summer_house
    return {'total': None, 'price_on_request': True}
