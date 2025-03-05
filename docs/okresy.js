import { defaultChurches, religionMap } from './common.js';

let checkedChurches = [...defaultChurches].map(String);
let map = null;
const districtLayers = {};
const colorScale = [
    [0, '#fee5d9'],
    [0.02, '#fcae91'],
    [0.05, '#fb6a4a'],
    [0.1, '#de2d26'],
    [0.15, '#a50f15'],
];

// Initialize the map
function initMap() {
    map = L.map('map').setView([49.8, 15.5], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
    }).addTo(map);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Get color based on percentage
function getColor(percentage) {
    for (let i = colorScale.length - 1; i >= 0; i--) {
        if (percentage >= colorScale[i][0]) {
            return colorScale[i][1];
        }
    }
    return colorScale[0][1];
}

// Style function for district polygons
function style(feature, percentage) {
    return {
        fillColor: getColor(percentage),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7,
    };
}

// Highlight district on hover
function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#666',
        fillOpacity: 0.7,
    });
    layer.bringToFront();
}

// Reset district highlight
function resetHighlight(e) {
    const layer = e.target;
    const percentage = layer.feature.properties.percentage;
    layer.setStyle(style(layer.feature, percentage));
}

async function loadAllDistricts() {
    try {
        // Load district index
        const uzemiResponse = await fetch('data/uzemi_index.csv');
        const uzemiData = await uzemiResponse.text();
        const uzemiRows = Papa.parse(uzemiData, { header: true }).data;

        // Filter for districts (5-digit codes)
        const districtRows = uzemiRows.filter(
            row => row.uzemi_kod && row.uzemi_kod.toString().length === 5,
        );

        // Load each district
        for (const district of districtRows) {
            const code = district.uzemi_kod;
            try {
                const response = await fetch(`okresy/${code}.geojson`);
                if (!response.ok) {
                    console.warn(`No GeoJSON found for district ${code}`);
                    continue;
                }

                const geojson = await response.json();
                const color = getRandomColor();

                L.geoJSON(geojson, {
                    style: {
                        fillColor: color,
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.7,
                    },
                    onEachFeature: (feature, layer) => {
                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: e => {
                                const popupContent = `
                                    <div class="bg-white p-4 rounded-lg shadow-lg">
                                        <h3 class="font-bold text-lg mb-2">${district.uzemi_txt}</h3>
                                        <p class="text-gray-700">Color: ${color}</p>
                                    </div>
                                `;

                                L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(map);
                            },
                        });
                    },
                }).addTo(map);
            } catch (error) {
                console.error(`Error loading district ${code}:`, error);
            }
        }
    } catch (error) {
        console.error('Error loading districts:', error);
    }
}

// Initialize the map and data
async function init() {
    try {
        initMap();
        await loadAllDistricts();

        // Set up modal controls
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeModal = document.getElementById('closeModal');
        const checkboxContainer = document.getElementById('checkboxContainer');
        const selectAll = document.getElementById('selectAll');
        const selectNone = document.getElementById('selectNone');
        const resetButton = document.getElementById('resetButton');
        const applySettings = document.getElementById('applySettings');

        // Create checkboxes for each religion
        Object.entries(religionMap)
            .sort((a, b) => b[1].count - a[1].count)
            .forEach(([id, { name, count }]) => {
                const div = document.createElement('div');
                div.className = 'flex items-center';
                div.innerHTML = `
                    <input type="checkbox" id="church-${id}" value="${id}"
                           class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                           ${checkedChurches.includes(id) ? 'checked' : ''}>
                    <label for="church-${id}" class="ml-2 block text-sm text-gray-900">
                        ${name} (${count.toLocaleString()})
                    </label>
                `;
                checkboxContainer.appendChild(div);
            });

        // Event listeners for modal controls
        settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
        closeModal.addEventListener('click', () => settingsModal.classList.add('hidden'));
        selectAll.addEventListener('click', () => {
            document
                .querySelectorAll('#checkboxContainer input[type="checkbox"]')
                .forEach(cb => (cb.checked = true));
        });
        selectNone.addEventListener('click', () => {
            document
                .querySelectorAll('#checkboxContainer input[type="checkbox"]')
                .forEach(cb => (cb.checked = false));
        });
        resetButton.addEventListener('click', () => {
            console.log('Resetting to default churches');
            const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = defaultChurches.includes(Number(checkbox.value));
            });
        });
        applySettings.addEventListener('click', () => {
            checkedChurches = Array.from(
                document.querySelectorAll('#checkboxContainer input[type="checkbox"]:checked'),
            ).map(cb => cb.value);
            console.log('applySettings');
            console.log('Checked churches:', checkedChurches);
            // updateMap(true);
            settingsModal.classList.add('hidden');
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading data. Check console.');
    }
}

async function loadDistrictData() {
    try {
        // Load data
        const response = await fetch('data/vira_by_uzemi.csv');
        const data = await response.text();
        const rows = Papa.parse(data, { header: true, dynamicTyping: true }).data;

        // Filter for districts with 5-digit codes starting with 4
        const districtData = rows.filter(row => {
            const code = String(row.uzemi_kod);
            return code.length === 5 && code.startsWith('4');
        });

        // Create object with district codes as keys
        const districts = {};
        for (const district of districtData) {
            districts[district.uzemi_kod] = district;
        }

        // Log the filtered data
        console.log('Districts with 5-digit codes starting with 4:', districts);
    } catch (error) {
        console.error('Error loading district data:', error);
    }
}

// Call the function when the script loads
async function main() {
    console.log('checkedChurches', checkedChurches);
    await loadDistrictData();
    await init();
}

main();
