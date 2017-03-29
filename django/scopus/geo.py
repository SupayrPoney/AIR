import requests


def geocode(city, country):
    resp = requests.get(
        "http://nominatim.openstreetmap.org/search",
        params={
            "city": city,
            "format": "json",
            "country": country,
            "dedupe": "1",
            "email": "nimarcha@vub.ac.be",
        }
    )

    j = resp.json()
    if len(j) > 0:
        return {
            "lat": j[0]['lat'],
            "lon": j[0]['lon'],
        }
