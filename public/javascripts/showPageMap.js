
mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: camp.geometry.coordinates, 
        zoom: 12
    });

    new mapboxgl.Marker({color:'green'})
    .setLngLat(camp.geometry.coordinates)
    .addTo(map);