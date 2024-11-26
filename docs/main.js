let checkedChurches = [10,42,5,21,2,3,25,12,14,15,47,48,33,53,56,57];
let circles = []; // Store circle references
let percentageFilter = 0; // Store current filter value
let religionMap = {
    1: { name: "Bez náboženské víry", count: 5027141 },
    99: { name: "Neuvedeno", count: 3162540 },
    46: { name: "věřící - nehlásící se k žádné církvi ani náboženské společnosti", count: 960201 },
    9: { name: "Církev římskokatolická", count: 741019 },
    41: { name: "katolická víra (katolík)", count: 235834 },
    43: { name: "křesťanství", count: 71089 },
    78: { name: "věřící - hlásící se k církvi - název neuveden", count: 65567 },
    20: { name: "Pravoslavná církev v českých zemích", count: 40681 },
    10: { name: "ČCE", count: 32577 },
    42: { name: "protestant/evangelík", count: 27149 },
    6: { name: "Církev československá husitská", count: 23610 },
    31: { name: "Jiné", count: 21308 },
    49: { name: "Jedi", count: 21023 },
    18: { name: "Náboženská společnost Svědkové Jehovovi", count: 13298 },
    5: { name: "CB", count: 10762 },
    8: { name: "Církev řeckokatolická", count: 8309 },
    4: { name: "CASD", count: 7162 },
    21: { name: "SCEAV", count: 7081 },
    27: { name: "islám", count: 5132 },
    28: { name: "buddhismus", count: 5049 },
    2: { name: "AC", count: 4958 },
    3: { name: "BJB", count: 3112 },
    51: { name: "pohanství", count: 2764 },
    64: { name: "pastafariánství", count: 2696 },
    25: { name: "KS", count: 2306 },
    11: { name: "ECAV", count: 2048 },
    16: { name: "Luterská evangelická církev a. v. v České republice", count: 1918 },
    44: { name: "judaismus", count: 1427 },
    14: { name: "JB", count: 1257 },
    29: { name: "hinduismus", count: 1226 },
    15: { name: "KřSb", count: 1224 },
    58: { name: "Společenství Josefa Zezulky", count: 1053 },
    66: { name: "satanismus", count: 998 },
    12: { name: "ECM", count: 896 },
    7: { name: "Církev Ježíše Krista Svatých posledních dnů v České republice", count: 713 },
    22: { name: "Starokatolická církev v ČR", count: 672 },
    32: { name: "Buddhismus Diamantové cesty linie Karma Kagjü", count: 653 },
    53: { name: "Církev víry", count: 608 },
    50: { name: "ateismus", count: 555 },
    52: { name: "Sith", count: 516 },
    36: { name: "Ruská pravoslavná církev, podvorje patriarchy moskevského a celé Rusi v České republice", count: 497 },
    13: { name: "Federace židovských obcí v České republice", count: 474 },
    30: { name: "Mezinárodní společnost pro vědomí Krišny, Hnutí Hare Krišna", count: 455 },
    35: { name: "Obec křesťanů v České republice", count: 409 },
    24: { name: "Scientologická církev", count: 397 },
    48: { name: "Církev Slovo života", count: 366 },
    33: { name: "Církev živého Boha", count: 299 },
    26: { name: "Anglikánská církev", count: 254 },
    38: { name: "Višva Nirmala Dharma", count: 250 },
    47: { name: "Církev Nová naděje", count: 232 },
    57: { name: "Církev Oáza", count: 206 },
    39: { name: "Hnutí Grálu", count: 196 },
    77: { name: "rastafariánství", count: 190 },
    76: { name: "druidismus", count: 189 },
    17: { name: "Náboženská společnost českých unitářů", count: 186 },
    59: { name: "Kněžské bratrstvo svatého Pia X.", count: 156 },
    69: { name: "baháismus", count: 118 },
    74: { name: "taoismus", count: 113 },
    37: { name: "Ústředí muslimských obcí", count: 112 },
    73: { name: "šintoismus", count: 111 },
    67: { name: "agnosticismus", count: 98 },
    55: { name: "Armáda spásy - církev", count: 96 },
    34: { name: "Česká hinduistická náboženská společnost", count: 93 },
    72: { name: "sikhismus", count: 86 },
    75: { name: "zoroastrismus", count: 76 },
    61: { name: "Společenství baptistických sborů", count: 60 },
    60: { name: "Théravádový buddhismus", count: 54 },
    19: { name: "Novoapoštolská církev v ČR", count: 53 },
    23: { name: "Církev sjednocení (moonisté)", count: 51 },
    56: { name: "Církev Nový Život", count: 49 },
    68: { name: "animismus", count: 42 },
    40: { name: "Hnutí Nového věku (New Age)", count: 20 },
    71: { name: "konfucianismus", count: 13 },
    63: { name: "Křesťanská církev essejská", count: 11 },
    45: { name: "esoterismus", count: 11 },
    70: { name: "deismus", count: 8 },
    54: { name: "Církev Svatého Řehoře Osvětitele", count: 3 },
    62: { name: "Společenství buddhismu v České republice", count: 1 },
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
                        name: religionMap[id].name,
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
                        name: religionMap[id].name,
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

function formatCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toPrecision(3) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toPrecision(3) + 'k';
    }
    return count;
}

// Modal functionality
document.getElementById('settingsBtn').addEventListener('click', () => {
    const modal = document.getElementById('settingsModal');
    const container = document.getElementById('checkboxContainer');

    // Clear existing checkboxes
    container.innerHTML = '';

    // Create checkboxes for each religion
    const religionMapSorted = Object.entries(religionMap).sort((a, b) => b[1].count - a[1].count);
    religionMapSorted.forEach(([id, value]) => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <input type="checkbox" id="religion${id}" value="${id}"
                   class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                   ${checkedChurches.includes(Number(id)) ? 'checked' : ''}>
            <label for="religion${id}" class="ml-2 text-sm text-gray-700">${value.name} (${formatCount(value.count)})</label>
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
