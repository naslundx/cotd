const infoBox = document.querySelector("#info");
const map = L.map("map").setView([20, 0], 2);
const modal = document.getElementById("myModal");
const modalFlag = document.querySelector(".modal-content img");
const modalContent = document.querySelector(".modal-content p");
const span = document.getElementsByClassName("close")[0];

let data = {};
let highlightedCountries = {};
let unHighlightedCountries = [];

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const showModal = () => {
  modal.style.display = "block";
};

const hideModal = () => {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    hideModal();
  }
};

const getStyle = (country, hover = false) => {
  const hasCountry = highlightedCountries.has(country);

  if (hover) {
    return {
      color: hasCountry ? "pink" : "lightgray",
      weight: 1,
      fillOpacity: 0.5,
    };
  } else {
    return {
      color: hasCountry ? "green" : "gray",
      weight: 1,
      fillOpacity: hasCountry ? 0.5 : 0.1,
    };
  }
};

document.querySelector("#go").addEventListener("click", () => {
  const randomElement =
    unHighlightedCountries[
      Math.floor(Math.random() * unHighlightedCountries.length)
    ];

  alert(randomElement);
});

fetch("data.json")
  .then((response) => response.json())
  .then((json) => (data = json))
  .then(() => {
    fetch("world.json")
      .then((response) => response.json())
      .then((worldData) => {
        highlightedCountries = new Set(Object.keys(data));
        unHighlightedCountries = worldData.features
          .map((feature) => feature.properties.name)
          .filter((name) => !highlightedCountries.has(name));

        L.geoJson(worldData, {
          style: (feature) => getStyle(feature.properties.name),
          onEachFeature: (feature, layer) => {
            const { name, iso_a2 } = feature.properties;

            layer.on("mouseover", function () {
              this.setStyle(getStyle(name, true));
              infoBox.innerHTML = `<strong>${name}</strong>`;
              infoBox.classList.remove("invisible");
            });

            layer.on("mouseout", function () {
              this.setStyle(getStyle(name));
              infoBox.classList.add("invisible");
            });

            // Click event for displaying country-specific text
            layer.on("click", function () {
              if (data[name]) {
                modalContent.innerText = data[name];
                modalFlag.src = `https://flagsapi.com/${iso_a2}/flat/64.png`;
                showModal();
              }
            });
          },
        }).addTo(map);
      })
      .catch((error) => console.error("Error loading data:", error));
  });
