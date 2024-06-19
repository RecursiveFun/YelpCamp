
mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v11',
        center: camp.geometry.coordinates, 
        zoom: 12
    });

    new mapboxgl.Marker({color:'green'})
    .setLngLat(camp.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${camp.title}</h3><p>${camp.location}</p><p>${camp.description}</p>`
        )
    )
    .addTo(map);