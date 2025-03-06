import { defaultChurches, religionMap } from './common.js';

let checkedChurches = [...defaultChurches].map(String);
let map = null;
const districtLayers = {};

const districtLabels = {};

const colorScale = [
    [0, '#fff'], // white
    [0.001, '#fff'], // white
    [0.002, '#f7e8b0'], // light yellow
    [0.005, '#f4b87d'], // peach/orange
    [0.01, '#f18d6c'], // salmon
    [0.02, '#e66a82'], // pink-red
    [0.05, '#d55099'], // dark pink
    [0.1, '#b840ab'], // magenta
    [0.2, '#8b2eb8'], // purple
    [0.3, '#6b1ec5'], // deeper purple
    [0.4, '#3449eb'], // bright blue
    [0.5, '#348feb'], // brighter blue
    [0.6, '#34dceb'], // brightest blue
    [0.7, '#2a9c5b'], // bright green
    [0.8, '#405745'], // medium bright green
    [0.9, '#000'], // green
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
        color: 'black',
        fillOpacity: 0.7,
    };
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

        // Store district labels for later use
        districtRows.forEach(district => {
            districtLabels[district.uzemi_kod] = district.uzemi_txt;
        });

        // Load the combined GeoJSON file
        const response = await fetch('combined-okresy.geojson');
        if (!response.ok) {
            console.error('Failed to load combined GeoJSON file');
            return;
        }

        const geojsonData = await response.json();

        // Process each feature in the combined GeoJSON
        geojsonData.features.forEach(feature => {
            const code = feature.properties.id;
            const districtName = districtLabels[code] || 'Unknown District';

            // Create a layer for this district
            const layer = L.geoJSON(feature, {
                style: {
                    fillColor: '#999',
                    weight: 2,
                    opacity: 1,
                    color: 'black',
                    fillOpacity: 0.7,
                },
                onEachFeature: (feature, layer) => {
                    const tooltipContent = `
                        <div class="bg-white p-4 rounded-lg shadow-lg">
                            <h3 class="font-bold text-lg mb-2">${districtName}</h3>
                        </div>
                    `;
                    layer.bindTooltip(tooltipContent, {
                        direction: 'center',
                        permanent: false,
                        sticky: true,
                        opacity: 0.9
                    });
                },
            }).addTo(map);

            // Store the layer for later use
            districtLayers[code] = layer;
        });
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
                .forEach(checkbox => {
                    checkbox.checked = true;
                });
        });
        selectNone.addEventListener('click', () => {
            document
                .querySelectorAll('#checkboxContainer input[type="checkbox"]')
                .forEach(checkbox => {
                    checkbox.checked = false;
                });
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
            loadDistrictData();
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

        // Process each district
        districtData.forEach(district => {
            // Calculate total believers (index 0 contains total population)
            const total = district['0'] || 0;

            // Sum up the checked churches
            let selectedCount = 0;
            for (const churchId of checkedChurches) {
                selectedCount += district[churchId] || 0;
            }

            // Calculate percentage
            const percentage = total > 0 ? selectedCount / total : 0;

            // Get the district layer directly from our stored layers
            const districtCode = String(district.uzemi_kod);
            const districtLayer = districtLayers[districtCode];

            if (districtLayer) {
                // Apply style to the layer directly
                districtLayer.setStyle(feature => style(feature, percentage));

                // Update popup content
                districtLayer.eachLayer(layer => {
                    // Create detailed church counts
                    const churchCounts = checkedChurches
                        .map(id => ({
                            name: religionMap[id].name,
                            count: district[id] || 0,
                            percentage: ((district[id] || 0) / total) * 100,
                        }))
                        .filter(c => c.count > 0)
                        .sort((a, b) => b.count - a.count);

                    const tooltipContent = `
                        <b>Okres ${districtLabels[districtCode] || 'District'}</b><br>
                        Population: ${total.toLocaleString()}<br>
                        Total Selected: ${selectedCount.toLocaleString()} (${(percentage * 100).toFixed(2)}%)<br>
                        <br>
                        ${churchCounts
                            .map(
                                c => `${c.name}: ${c.count.toLocaleString()} (${c.percentage.toFixed(2)}%)`,
                            )
                            .join('<br>')}
                    `;
                    layer.unbindTooltip();
                    layer.bindTooltip(tooltipContent, {
                        direction: 'center',
                        permanent: false,
                        sticky: true,
                        opacity: 0.9
                    });
                });
            }
        });

        // Update legend
        // Remove existing legend if it exists
        if (map.legend) {
            map.legend.remove();
        }

        // Create new legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = () => {
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
        map.legend = legend;

    } catch (error) {
        console.error('Error loading district data:', error);
    }
}

async function main() {
    await init();
    await loadDistrictData();
}

main().catch(error => {
    console.error('Main error:', error);
    alert('Failed to initialize application. Check console for details.');
});
