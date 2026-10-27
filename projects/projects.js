import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const title = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

const allYears = [...new Set(projects.map((p) => String(p.year)))];
const colors = d3.scaleOrdinal(d3.schemeTableau10).domain(allYears);
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let query = '';
let selectedYear = null;

function searchProjects() {
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function update() {
  let searched = searchProjects();
  let visible = selectedYear === null
    ? searched
    : searched.filter((p) => String(p.year) === selectedYear);
  renderProjects(visible, projectsContainer, 'h2');
  title.textContent = `${visible.length} Projects`;
  renderPieChart(searched);
}

function toggleYear(year) {
  selectedYear = selectedYear === year ? null : year;
  update();
}

function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(projectsGiven, (v) => v.length, (d) => d.year);
  let data = rolledData.map(([year, count]) => ({ value: count, label: String(year) }));
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcs = sliceGenerator(data).map((d) => arcGenerator(d));

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(data[i].label))
      .attr('class', data[i].label === selectedYear ? 'selected' : null)
      .on('click', () => toggleYear(data[i].label));
  });

  data.forEach((d) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(d.label)}`)
      .attr('class', d.label === selectedYear ? 'legend-item selected' : 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => toggleYear(d.label));
  });
}

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  update();
});

update();