import { religionMap, defaultChurches } from './common.js';

let checkedChurches = [...defaultChurches];
let map = null;
let districtLayers = {};
let colorScale = [
    [0, '#fee5d9'],
    [0.02, '#fcae91'],
    [0.05, '#fb6a4a'],
    [0.10, '#de2d26'],
    [0.15, '#a50f15']
];

// Initialize the map
function initMap() {
    map = L.map('map').setView([49.8, 15.5], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
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
        fillOpacity: 0.7
    };
}

// Highlight district on hover
function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#666',
        fillOpacity: 0.7
    });
    layer.bringToFront();
}

// Reset district highlight
function resetHighlight(e) {
    const layer = e.target;
    const percentage = layer.feature.properties.percentage;
    layer.setStyle(style(layer.feature, percentage));
}

async function updateMap(filterOnly = false) {
    if (!filterOnly) {
        // Load district data
        const [viraData, uzemiIndex] = await Promise.all([
            fetch('vira_by_uzemi.csv').then(r => r.text()),
            fetch('uzemi_index.csv').then(r => r.text())
        ]);

        // Parse data
        const viraRows = Papa.parse(viraData, { header: true, dynamicTyping: true }).data;
        const uzemiRows = Papa.parse(uzemiIndex, { header: true }).data;

        // Filter for districts (5-digit codes)
        const districtRows = uzemiRows.filter(row =>
            row.uzemi_kod && row.uzemi_kod.toString().length === 5
        );

        // Process each district
        for (const district of districtRows) {
            const code = district.uzemi_kod;
            try {
                // Load district GeoJSON with the correct relative path
                const response = await fetch(`okresy/${code}.geojson`);
                if (!response.ok) {
                    console.warn(`No GeoJSON found for district ${code}`);
                    continue;
                }

                const geojson = await response.json();

                // Find religious data for this district - convert both to strings for comparison
                const viraRow = viraRows.find(row => row.uzemi_kod.toString() === code.toString());
                if (!viraRow) {
                    console.warn(`No religious data found for district ${code}`);
                    continue;
                }

                // Calculate religious percentages
                let selectedCount = 0;
                for (let id of checkedChurches) {
                    selectedCount += viraRow[id] || 0;
                }
                const total = Object.keys(viraRow)
                    .filter(k => !isNaN(k) && k !== "0")
                    .reduce((sum, k) => sum + (viraRow[k] || 0), 0);
                const percentage = selectedCount / total;

                // Add properties to GeoJSON
                geojson.features[0].properties = {
                    ...geojson.features[0].properties,
                    name: district.uzemi_txt,
                    percentage: percentage,
                    selectedCount: selectedCount,
                    total: total,
                    viraData: viraRow
                };

                // Create and style the layer
                const layer = L.geoJSON(geojson, {
                    style: feature => style(feature, percentage),
                    onEachFeature: (feature, layer) => {
                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: (e) => {
                                const props = e.target.feature.properties;
                                const churchCounts = checkedChurches
                                    .map(id => ({
                                        name: religionMap[id].name,
                                        count: props.viraData[id] || 0,
                                        percentage: ((props.viraData[id] || 0) / props.total * 100)
                                    }))
                                    .filter(c => c.count > 0)
                                    .sort((a, b) => b.count - a.count);

                                const popupContent = `
                                    <b>${props.name}</b><br>
                                    Obyvatelstvo celkem: ${props.total.toLocaleString()}<br>
                                    Vybraných: ${props.selectedCount.toLocaleString()} (${(props.percentage * 100).toFixed(2)}%)<br>
                                    <br>
                                    ${churchCounts.map(c =>
                                        `${c.name}: ${c.count.toLocaleString()} (${c.percentage.toFixed(2)}%)`
                                    ).join('<br>')}
                                `;
                                L.popup()
                                    .setLatLng(e.latlng)
                                    .setContent(popupContent)
                                    .openOn(map);
                            }
                        });
                    }
                });

                // Store the layer and add to map
                if (districtLayers[code]) {
                    map.removeLayer(districtLayers[code]);
                }
                districtLayers[code] = layer;
                layer.addTo(map);
            } catch (error) {
                console.error(`Error loading district ${code}:`, error);
            }
        }

        // Add legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = '<h4>Vybrané %</h4>';

            colorScale.forEach(([value, color]) => {
                div.innerHTML += `
                    <div>
                        <span class="legend-circle" style="background:${color}"></span>
                        ${(value * 100).toFixed(2)}%
                    </div>`;
            });
            return div;
        };
        legend.addTo(map);
    } else {
        // Update existing layers with new percentages
        Object.entries(districtLayers).forEach(([code, layer]) => {
            const feature = layer.feature || layer.toGeoJSON().features[0];
            const viraData = feature.properties.viraData;

            let selectedCount = 0;
            for (let id of checkedChurches) {
                selectedCount += viraData[id] || 0;
            }
            const total = Object.keys(viraData)
                .filter(k => !isNaN(k) && k !== "0")
                .reduce((sum, k) => sum + (viraData[k] || 0), 0);
            const percentage = selectedCount / total;

            feature.properties.percentage = percentage;
            feature.properties.selectedCount = selectedCount;

            layer.setStyle(style(feature, percentage));
        });
    }
}

async function loadAllDistricts() {
    try {
        // Load district index
        const uzemiResponse = await fetch('uzemi_index.csv');
        const uzemiData = await uzemiResponse.text();
        const uzemiRows = Papa.parse(uzemiData, { header: true }).data;

        // Filter for districts (5-digit codes)
        const districtRows = uzemiRows.filter(row =>
            row.uzemi_kod && row.uzemi_kod.toString().length === 5
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
                        fillOpacity: 0.7
                    },
                    onEachFeature: (feature, layer) => {
                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: (e) => {
                                const popupContent = `
                                    <div class="bg-white p-4 rounded-lg shadow-lg">
                                        <h3 class="font-bold text-lg mb-2">${district.uzemi_txt}</h3>
                                        <p class="text-gray-700">Color: ${color}</p>
                                    </div>
                                `;

                                L.popup()
                                    .setLatLng(e.latlng)
                                    .setContent(popupContent)
                                    .openOn(map);
                            }
                        });
                    }
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
            document.querySelectorAll('#checkboxContainer input[type="checkbox"]')
                .forEach(cb => cb.checked = true);
        });
        selectNone.addEventListener('click', () => {
            document.querySelectorAll('#checkboxContainer input[type="checkbox"]')
                .forEach(cb => cb.checked = false);
        });
        resetButton.addEventListener('click', () => {
            checkedChurches = [...defaultChurches];
            document.querySelectorAll('#checkboxContainer input[type="checkbox"]')
                .forEach(cb => cb.checked = defaultChurches.includes(cb.value));
            updateMap(true);
            settingsModal.classList.add('hidden');
        });
        applySettings.addEventListener('click', () => {
            checkedChurches = Array.from(
                document.querySelectorAll('#checkboxContainer input[type="checkbox"]:checked')
            ).map(cb => cb.value);
            updateMap(true);
            settingsModal.classList.add('hidden');
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading data. Check console.');
    }
}

init();
