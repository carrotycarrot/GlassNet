function initMap() {
    const venice = { lat: 45.43815683667079, lng: 12.34111728281106 };
    const murano = { lat: 45.4593620687731, lng: 12.352409296643176 };


    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: venice,
    });

    const marker = new google.maps.Marker({
        position: murano,
        map: map,
        title: "Murano",
    });
}