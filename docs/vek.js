import { religionMap, defaultChurches } from './common.js';

let checkedChurches = [...defaultChurches];
let svg = null;
let isRelative = false;

async function createPyramid() {
    // Clear existing visualization
    d3.select('#pyramid').html('');

    // Load and parse the CSV data
    const rawData = await d3.csv('data/vira_vek_cr.csv');

    // Process the data
    const data = rawData.reduce((acc, row) => {
        const age = row.vek_txt;
        if (!acc[age]) {
            acc[age] = {
                age,
                men: { selected: 0, total: 0 },
                women: { selected: 0, total: 0 }
            };
        }

        // Sum up all values for the row
        const rowTotal = Object.keys(row)
            .filter(k => !isNaN(k) && k !== "0")
            .reduce((sum, k) => sum + (+row[k] || 0), 0);

        if (row.pohlavi_kod === "1") { // Men
            acc[age].men.total += rowTotal;
            checkedChurches.forEach(id => {
                acc[age].men.selected += +(row[id] || 0);
            });
        } else { // Women
            acc[age].women.total += rowTotal;
            checkedChurches.forEach(id => {
                acc[age].women.selected += +(row[id] || 0);
            });
        }

        return acc;
    }, {});

    // Convert to array and sort by age
    // Process the data and combine 93+ ages
    const processedData = Object.values(data).reduce((acc, row) => {
        if (+row.age >= 93) {
            // Add to 93+ bucket
            if (!acc.find(x => x.age === "93+")) {
                acc.push({
                    age: "93+",
                    men: { selected: 0, total: 0 },
                    women: { selected: 0, total: 0 }
                });
            }
            const bucket = acc.find(x => x.age === "93+");
            bucket.men.selected += row.men.selected;
            bucket.men.total += row.men.total;
            bucket.women.selected += row.women.selected;
            bucket.women.total += row.women.total;
        } else {
            acc.push(row);
        }
        return acc;
    }, []).sort((a, b) => {
        if (a.age === "93+") return -1;
        if (b.age === "93+") return 1;
        return +b.age - +a.age;
    });

    // Set up dimensions
    const container = document.getElementById('pyramid');
    const margin = {top: 40, right: 180, bottom: 40, left: 180};
    const width = Math.min(1000, container.clientWidth) - margin.left - margin.right;
    const height = Math.min(600, window.innerHeight * 0.8) - margin.top - margin.bottom;
    const barHeight = height / processedData.length;

    // Create SVG
    svg = d3.select('#pyramid')
        .append('svg')
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('width', '100%')
        .attr('height', '100%')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(processedData, d =>
            Math.max(
                isRelative ? d.men.selected / d.men.total : d.men.selected,
                isRelative ? d.women.selected / d.women.total : d.women.selected
            ))])
        .range([0, width/2 - 5]);

    // Calculate nice max value for axis
    const maxValue = d3.max(processedData, d =>
        Math.max(
            isRelative ? d.men.selected / d.men.total : d.men.selected,
            isRelative ? d.women.selected / d.women.total : d.women.selected
        ));
    const niceMax = isRelative ?
        Math.ceil(maxValue * 100) / 100 : // For percentages
        Math.ceil(maxValue / Math.pow(10, Math.floor(Math.log10(maxValue)))) * Math.pow(10, Math.floor(Math.log10(maxValue))); // For absolute numbers

    // Bottom axis
    const xAxisScale = d3.scaleLinear()
        .domain([0, niceMax])
        .range([0, width/2 - 5]);

    const xAxisLeft = d3.axisBottom(xAxisScale)
        .ticks(5)
        .tickFormat(isRelative ? d => d3.format(".2%")(Math.abs(d)) : d3.format(","));

    const xAxisRight = d3.axisBottom(xAxisScale)
        .ticks(5)
        .tickFormat(d3.format(","));

    svg.append("g")
        .attr("transform", `translate(${width/2 - xScale(niceMax)}, ${height})`)
        .call(xAxisLeft);

    svg.append("g")
        .attr("transform", `translate(${width/2 + 5}, ${height})`)
        .call(xAxisRight);

    // Create bars for each category
    processedData.forEach((d, i) => {
        // Men (left side)
        const menRect = svg.append('rect')
            .attr('x', width/2 - xScale(isRelative ? d.men.selected / d.men.total : d.men.selected))
            .attr('y', i * barHeight)
            .attr('width', xScale(isRelative ? d.men.selected / d.men.total : d.men.selected))
            .attr('height', barHeight - 1)
            .attr('fill', '#4a9eff')
            .attr('opacity', 0.7)
            .node();

        tippy(menRect, {
            content: `${d.age} roků: ${d3.format(',')(d.men.selected)} (${d3.format('.2%')(d.men.selected / d.men.total)})`,
            theme: 'light',
            placement: 'left'
        });

        // Women (right side)
        const womenRect = svg.append('rect')
            .attr('x', width/2 + 5)
            .attr('y', i * barHeight)
            .attr('width', xScale(isRelative ? d.women.selected / d.women.total : d.women.selected))
            .attr('height', barHeight - 1)
            .attr('fill', '#ff4a4a')
            .attr('opacity', 0.7)
            .node();

        tippy(womenRect, {
            content: `${d.age} roků: ${d3.format(',')(d.women.selected)} (${d3.format('.2%')(d.women.selected / d.women.total)})`,
            theme: 'light',
            placement: 'right'
        });

        // Only show decade labels (0, 10, 20, etc)
        if (d.age % 10 === 0) {
            svg.append('text')
                .attr('x', width/2)
                .attr('y', i * barHeight + barHeight/2)
                .attr('dy', '.35em')
                .attr('text-anchor', 'middle')
                .attr('class', 'axis-label')
                .text(d.age);
        }
    });

    // Add legend
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width/2}, ${-30})`);

    legend.append('rect')
        .attr('x', -100)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#4a9eff')
        .attr('opacity', 0.7);

    const menTotal = d3.sum(processedData, d => d.men.selected);
    legend.append('text')
        .attr('x', -80)
        .attr('y', 12)
        .text(`Muži (${d3.format(',')(menTotal)})`);

    legend.append('rect')
        .attr('x', 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#ff4a4a')
        .attr('opacity', 0.7);

    const womenTotal = d3.sum(processedData, d => d.women.selected);
    legend.append('text')
        .attr('x', 40)
        .attr('y', 12)
        .text(`Ženy (${d3.format(',')(womenTotal)})`);
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
            <label for="religion${id}" class="ml-2 text-sm text-gray-700">
                ${value.name} (${value.count.toLocaleString()})
            </label>
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
    checkboxes.forEach(checkbox => checkbox.checked = true);
});

document.getElementById('selectNone').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
});

document.getElementById('resetButton').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = defaultChurches.includes(Number(checkbox.value));
    });
});

document.getElementById('applySettings').addEventListener('click', async () => {
    // Update checkedChurches based on selected checkboxes
    checkedChurches = Array.from(document.querySelectorAll('#checkboxContainer input[type="checkbox"]:checked'))
        .map(checkbox => Number(checkbox.value));

    // Close modal
    document.getElementById('settingsModal').classList.add('hidden');

    // Update the visualization
    await createPyramid();
});

// Toggle button handler
document.getElementById('toggleView').addEventListener('click', async () => {
    const btn = document.getElementById('toggleView');
    isRelative = !isRelative;
    btn.textContent = isRelative ? 'Přepnout na absolutní' : 'Přepnout na %';
    await createPyramid();
});

// Initialize the visualization
createPyramid();

// Make it responsive
window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        createPyramid();
    }, 250);
});
