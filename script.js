// ---
// Internal logic

const fetchJson = async (filename) => {
  const response = await fetch(filename);
  const data = await response.json();
  return data;
};

// UI
//
const showModal = (type, data) => {
  const modalContent = document.querySelector(`#modal-content-${type}`);
  modal.style.display = "block";
  modalContent.classList.remove("invisible");

  if (type === "one") {
    const modalFlag = document.querySelector(".modal-content img");
    const modalWikiLink = document.querySelector(".modal-content p#wiki a");
    const modalText = document.querySelector("#modal-content-one p#content");
    const { order, name, content, iso_a2 } = data;

    modalWikiLink.href = `https://en.wikipedia.org/wiki/${name}`;
    modalText.innerText = `(${order}: ${name})\n${content}`;
    modalFlag.src = `https://flagsapi.com/${iso_a2}/flat/64.png`;
  } else if (type === "two") {
    // ...
  } else if (type === "three") {
    const modalText = document.querySelector("#modal-content-three p");
    modalText.innerText = data;
  }
};

const hideModal = () => {
  modal.style.display = "none";
  document
    .querySelectorAll(".modal-selector")
    .forEach((e) => e.classList.add("invisible"));
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

// ---

const infoBox = document.querySelector("#info");
const map = L.map("map").setView([20, 0], 2);
const modal = document.getElementById("myModal");
const list = document.querySelector("#list");
const listContent = document.querySelector("#modal-content-two ul");
const span = document.getElementsByClassName("close")[0];

const cotdResults = await fetchJson("data.json");
const mapData = await fetchJson("world.json");

const highlightedCountries = new Set(Object.keys(cotdResults));
highlightedCountries.forEach((name) => {
  const { order } = cotdResults[name];
  const listItem = document.createElement("li");
  listItem.innerText = `${order}: ${name}`;
  listContent.appendChild(listItem);
});

const unHighlightedCountries = mapData.features
  .map((feature) => feature.properties.name)
  .filter((name) => !highlightedCountries.has(name));

const countriesOfTheWorld = new Set(
  mapData.features.map((feature) => feature.properties.name),
);
Object.keys(cotdResults).forEach((name) => {
  if (!countriesOfTheWorld.has(name)) {
    console.log(`Failed to find ${name}`);
  }
});

window.onclick = function (event) {
  if (event.target == modal) {
    hideModal();
  }
};

// List button
document.querySelector("#showlist").addEventListener("click", () => {
  showModal("two");
});

// New button
document.querySelector("#go").addEventListener("click", () => {
  const randomElement =
    unHighlightedCountries[
      Math.floor(Math.random() * unHighlightedCountries.length)
    ];

  showModal("three", randomElement);
});

// Draw map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

L.geoJson(mapData, {
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

    layer.on("click", function () {
      if (cotdResults[name]) {
        let data = { iso_a2, name, ...cotdResults[name] };
        showModal("one", data);
      }
    });
  },
}).addTo(map);
