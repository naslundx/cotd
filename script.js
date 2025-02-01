const infoBox = document.querySelector("#info");
const map = L.map('map').setView([20, 0], 2);
const modal = document.getElementById("myModal");
const modalContent = document.querySelector(".modal-content p");
const span = document.getElementsByClassName("close")[0];

const data = {
    "Sweden": "Sweden is known for its stunning landscapes and progressive society.",
    "France": "France is famous for its cuisine, culture, and landmarks like the Eiffel Tower.",
    "Japan": "Japan blends ancient traditions with modern technology."
}

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const showModal = () => {
    modal.style.display = "block";
}

const hideModal = () => {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        hideModal();
    }
} 

const highlightedCountries = new Set(Object.keys(data));
let unHighlightedCountries = [];

const getStyle = (country, hover = false) => {
    const hasCountry = highlightedCountries.has(country);

    if (hover) {
        return {
            color: hasCountry ? 'pink' : 'lightgray',
            weight: 1,
            fillOpacity: 0.5
        }
    }
    else {
        return {
            color: hasCountry ? 'red' : 'gray',
            weight: 1,
            fillOpacity: hasCountry ? 0.5 : 0.1
        }
    }
}

document.querySelector("#go").addEventListener('click', () => {
    const randomElement = unHighlightedCountries[Math.floor(Math.random() * unHighlightedCountries.length)];

    alert(randomElement);
})

fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    .then(response => response.json())
    .then(worldData => {
        unHighlightedCountries = worldData.features.map(feature => feature.properties.name).filter(name => !highlightedCountries.has(name));
        L.geoJson(worldData, {
            style: feature => getStyle(feature.properties.name),
            onEachFeature: (feature, layer) => {
                const countryName = feature.properties.name;

                layer.on('mouseover', function () {
                    this.setStyle(getStyle(countryName, true));
                    //infoBox.innerHTML = `<strong>${countryName}</strong>`;
                    //infoBox.style.display = 'block';
                });

                layer.on('mouseout', function () {
                    this.setStyle(getStyle(countryName));
                    //infoBox.style.display = 'none';
                });

                // Click event for displaying country-specific text
                layer.on('click', function () {
                    if (data[countryName]) {
                        modalContent.innerText = data[countryName];
                        showModal();
                    } else {
                        alert(`No additional information available for ${countryName}.`);
                    }
                });
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error loading data:', error));
