let checkedChurches = [10,42,5,21,2,3,25,12,14,15,47,48,53,57];
let circles = []; // Store circle references
let percentageFilter = 0; // Store current filter value
let religionMap = {
    1: "Bez náboženské víry",
    2: "AC",
    3: "BJB",
    4: "CASD",
    5: "CB",
    6: "CČH",
    7: "Církev Ježíše Krista Svatých posledních dnů v České republice",
    8: "Církev řeckokatolická",
    9: "Církev římskokatolická",
    10: "ČCE",
    11: "ECAV",
    12: "ECM",
    13: "Federace židovských obcí v České republice",
    14: "JB",
    15: "KřSb",
    16: "Luterská evangelická církev a. v. v České republice",
    17: "Náboženská společnost českých unitářů",
    18: "Náboženská společnost Svědkové Jehovovi",
    19: "Novoapoštolská církev v ČR",
    20: "Pravoslavná církev v českých zemích",
    21: "SCEAV",
    22: "Starokatolická církev v ČR",
    23: "Církev sjednocení (moonisté)",
    24: "Scientologická církev",
    25: "KS",
    26: "Anglikánská církev",
    27: "islám",
    28: "buddhismus",
    29: "hinduismus",
    30: "Mezinárodní společnost pro vědomí Krišny, Hnutí Hare Krišna",
    31: "Jiné",
    32: "Buddhismus Diamantové cesty linie Karma Kagjü",
    33: "Církev živého Boha",
    34: "Česká hinduistická náboženská společnost",
    35: "Obec křesťanů v České republice",
    36: "Ruská pravoslavná církev, podvorje patriarchy moskevského a celé Rusi v České republice",
    37: "Ústředí muslimských obcí",
    38: "Višva Nirmala Dharma",
    39: "Hnutí Grálu",
    40: "Hnutí Nového věku (New Age)",
    41: "katolická víra (katolík)",
    42: "protestant/evangelík",
    43: "křesťanství",
    44: "judaismus",
    45: "esoterismus",
    46: "věřící - nehlásící se k žádné církvi ani náboženské společnosti",
    47: "CNN",
    48: "Církev Slovo života",
    49: "Jedi",
    50: "ateismus",
    51: "pohanství",
    52: "Sith",
    53: "Církev víry",
    54: "Církev Svatého Řehoře Osvětitele",
    55: "Armáda spásy - církev",
    56: "Církev Nový Život",
    57: "Církev Oáza",
    58: "Společenství Josefa Zezulky",
    59: "Kněžské bratrstvo svatého Pia X.",
    60: "Théravádový buddhismus",
    61: "Společenství baptistických sborů",
    62: "Společenství buddhismu v České republice",
    63: "Křesťanská církev essejská",
    64: "pastafariánství",
    66: "satanismus",
    67: "agnosticismus",
    68: "animismus",
    69: "baháismus",
    70: "deismus",
    71: "konfucianismus",
    72: "sikhismus",
    73: "šintoismus",
    74: "taoismus",
    75: "zoroastrismus",
    76: "druidismus",
    77: "rastafariánství",
    78: "věřící - hlásící se k církvi - název neuveden",
    99: "Neuvedeno"
};

const colorScale = [
    [0, '#fff'],  // white
    [0.001, '#fff'],  // white
    [0.002, '#f7e8b0'],  // light yellow
    [0.005, '#f4b87d'],  // peach/orange
    [0.01, '#f18d6c'],   // salmon
    [0.02, '#e66a82'],   // pink-red
    [0.05, '#d55099'],   // dark pink
    [0.1, '#b840ab'],    // magenta
    [0.2, '#8b2eb8'],    // purple
    [0.3, '#6b1ec5'],    // deeper purple
    [0.4, '#3449eb'],    // bright blue
    [0.5, '#348feb'],    // brighter blue
    [0.6, '#34dceb'],    // brightest blue
    [0.7, '#2a9c5b'],    // bright green
    [0.8, '#405745'],    // medium bright green
    [0.9, '#000']     // green
];

function getColor(percentage) {
    // Return color for the matching threshold
    for (let i = colorScale.length - 1; i >= 0; i--) {
        if (percentage >= colorScale[i][0]) {
            return colorScale[i][1];
        }
    }
    return colorScale[0][1]; // Default to lowest color
}

const map = L.map('map').setView([49.8, 15.5], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const SCALE_FACTOR = 0.002;
async function updateMap(filterOnly = false) {
    if (!filterOnly) {
        // Clear existing circles
        circles.forEach(({circle}) => circle.remove());
        circles = [];
    }

    try {
        // Re-process the data with new checkedChurches
        const [viraData, municipalities] = await Promise.all([
            fetch('vira_by_uzemi.csv').then(r => r.text()),
            fetch('municipalities.csv').then(r => r.text())
        ]);

        const viraRows = Papa.parse(viraData, {header: true, dynamicTyping: true}).data;
        const municipalityMap = Papa.parse(municipalities, {header: true}).data
            .reduce((acc, row) => {
                acc[row.uzemi_kod] = row;
                return acc;
            }, {});

        // Process municipalities with the new checkedChurches
        viraRows.sort((a, b) => {
            const totalA = Object.keys(a)
                .filter(k => !isNaN(k) && k !== "0")
                .reduce((sum, k) => sum + (a[k] || 0), 0);
            const totalB = Object.keys(b)
                .filter(k => !isNaN(k) && k !== "0")
                .reduce((sum, k) => sum + (b[k] || 0), 0);
            return totalB - totalA;
        });

        viraRows.forEach(row => {
            const municipality = municipalityMap[row.uzemi_kod];
            if (!municipality || !municipality.lat || !municipality.lon) return;

            let selectedCount = 0;
            for (let id of checkedChurches) {
                selectedCount += row[id] || 0;
            }
            const total = Object.keys(row)
                .filter(k => !isNaN(k) && k !== "0")
                .reduce((sum, k) => sum + (row[k] || 0), 0);
            const percentage = selectedCount / total;

            const circle = L.circleMarker([municipality.lat, municipality.lon], {
                radius: Math.sqrt(total * SCALE_FACTOR) * Math.pow(2, map.getZoom() - 8),
                fillColor: getColor(percentage),
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            })
            .bindPopup(() => {
                const churchCounts = checkedChurches
                    .map(id => ({
                        name: religionMap[id],
                        count: row[id] || 0,
                        percentage: ((row[id] || 0) / total * 100)
                    }))
                    .filter(c => c.count > 0)
                    .sort((a, b) => b.count - a.count);

                return `
                    <b>${municipality.name}</b><br>
                    Obyvatelstvo celkem: ${total.toLocaleString()}<br>
                    Vybraných: ${selectedCount.toLocaleString()} (${(percentage * 100).toFixed(2)}%)<br>
                    <br>
                    ${churchCounts.map(c =>
                        `${c.name}: ${c.count.toLocaleString()} (${c.percentage.toFixed(2)}%)`
                    ).join('<br>')}
                `;
            })
            .addTo(map);

            // Store percentage with circle data
            circles.push({
                circle,
                baseRadius: Math.sqrt(total * SCALE_FACTOR),
                percentage: percentage
            });

            // Apply initial filter
            if (percentage * 100 < percentageFilter) {
                circle.setStyle({ opacity: 0, fillOpacity: 0 });
            }
        });

        // Update circles on zoom
        map.on('zoomend', () => {
            circles.forEach(({circle, baseRadius}) => {
                circle.setRadius(baseRadius * Math.pow(2, map.getZoom() - 8));
            });
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Error updating map. Check console.');
    }
}

async function init() {
    try {
        // Load all CSV files
        const [viraData, viraIndex, uzemiIndex, municipalities] = await Promise.all([
            fetch('vira_by_uzemi.csv').then(r => r.text()),
            fetch('vira_index.csv').then(r => r.text()),
            fetch('uzemi_index.csv').then(r => r.text()),
            fetch('municipalities.csv').then(r => r.text())
        ]);

        // Parse all files
        const viraRows = Papa.parse(viraData, {header: true, dynamicTyping: true}).data;
        const viraMap = Papa.parse(viraIndex, {header: true}).data;
        const uzemiMap = Papa.parse(uzemiIndex, {header: true}).data;
        const municipalityMap = Papa.parse(municipalities, {header: true}).data
            .reduce((acc, row) => {
                acc[row.uzemi_kod] = row;
                return acc;
            }, {});

        // Initialize the religionMap
        // First prepare all circle markers
        const circleMarkers = [];
        viraRows.forEach(row => {
            if (String(row.uzemi_kod).length < 6) return;
            const municipality = municipalityMap[row.uzemi_kod];
            if (!municipality) {
                // console.log(`Missing municipality for: ${row.uzemi_kod}`);
                return;
            }

            if (!municipality.lat || !municipality.lon) {
                console.log(`Missing coordinates for: ${municipality.name} (${row.uzemi_kod})`);
                return;
            }

            let selectedCount = 0;
            for (let id of checkedChurches) {
                selectedCount += row[id] || 0;
            }
            const total = Object.keys(row)
                .filter(k => !isNaN(k) && k !== "0")
                .reduce((sum, k) => sum + (row[k] || 0), 0);
            const percentage = selectedCount / total;

            const circle = L.circleMarker([municipality.lat, municipality.lon], {
                radius: Math.sqrt(total * SCALE_FACTOR) * Math.pow(2, map.getZoom() - 8),
                fillColor: getColor(percentage),
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            })
            .bindPopup(() => {
                const churchCounts = checkedChurches
                    .map(id => ({
                        name: religionMap[id],
                        count: row[id] || 0,
                        percentage: ((row[id] || 0) / total * 100)
                    }))
                    .filter(c => c.count > 0)
                    .sort((a, b) => b.count - a.count);

                return `
                    <b>${municipality.name}</b><br>
                    Population: ${total.toLocaleString()}<br>
                    Total Selected: ${selectedCount.toLocaleString()} (${(percentage * 100).toFixed(2)}%)<br>
                    <br>
                    ${churchCounts.map(c =>
                        `${c.name}: ${c.count.toLocaleString()} (${c.percentage.toFixed(2)}%)`
                    ).join('<br>')}
                `;
            });

            circleMarkers.push({
                circle,
                baseRadius: Math.sqrt(total * SCALE_FACTOR),
                total
            });
        });

        // Sort by total population (which determines radius)
        circleMarkers.sort((a, b) => b.total - a.total);

        // Add markers to map in order from largest to smallest
        circleMarkers.forEach(({circle, baseRadius}) => {
            circle.addTo(map);
            circles.push({circle, baseRadius});
        });

        // Update circles on zoom
        map.on('zoomend', () => {
            circles.forEach(({circle, baseRadius}) => {
                circle.setRadius(baseRadius * Math.pow(2, map.getZoom() - 8));
            });
        });

        // Update legend to show percentages instead of population
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

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading data. Check console.');
    }
}

// Modal functionality
document.getElementById('settingsBtn').addEventListener('click', () => {
    const modal = document.getElementById('settingsModal');
    const container = document.getElementById('checkboxContainer');

    // Clear existing checkboxes
    container.innerHTML = '';

    // Create checkboxes for each religion
    Object.entries(religionMap).forEach(([id, name]) => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <input type="checkbox" id="religion${id}" value="${id}"
                   class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                   ${checkedChurches.includes(Number(id)) ? 'checked' : ''}>
            <label for="religion${id}" class="ml-2 text-sm text-gray-700">${name}</label>
        `;
        container.appendChild(div);
    });

    modal.classList.remove('hidden');
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.add('hidden');
});

document.getElementById('selectAll').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (Object.keys(religionMap).includes(checkbox.value)) {
            checkbox.checked = true;
        }
    });
});

document.getElementById('selectNone').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
});

document.getElementById('resetButton').addEventListener('click', () => {
    const defaultChurches = [10,42,5,21,2,3,25,12,14,15,47,48,53,57];
    const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = defaultChurches.includes(Number(checkbox.value));
    });

    // Reset the percentage filters to default values
    document.getElementById('minPercentage').value = '0';
    document.getElementById('maxPercentage').value = '100';
});

document.getElementById('applySettings').addEventListener('click', async () => {
    // Update checkedChurches based on selected checkboxes
    checkedChurches = Array.from(document.querySelectorAll('#checkboxContainer input[type="checkbox"]:checked'))
        .map(checkbox => Number(checkbox.value));

    // Update percentage filters
    const minPercentage = parseFloat(document.getElementById('minPercentage').value);
    const maxPercentage = parseFloat(document.getElementById('maxPercentage').value);

    // Close modal
    document.getElementById('settingsModal').classList.add('hidden');

    // Update the map
    await updateMap();

    // Apply filter
    circles.forEach(({circle, percentage}) => {
        const percentageValue = percentage * 100;
        if (percentageValue >= minPercentage && percentageValue <= maxPercentage) {
            circle.setStyle({ opacity: 1, fillOpacity: 0.8 });
        } else {
            circle.setStyle({ opacity: 0, fillOpacity: 0 });
        }
    });
});

// Initialize the map
init();
