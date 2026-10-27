function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/'
    : '/portfolio/';

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/aarmansachdev', title: 'GitHub' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  url = !url.startsWith('http') ? BASE_PATH + url : url;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;
  a.classList.toggle('current', a.host === location.host && a.pathname === location.pathname);
  if (a.host !== location.host) {
    a.target = '_blank';
  }
  nav.append(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic (Dark/Light)</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`
);

let select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', (event) => {
  setColorScheme(event.target.value);
  localStorage.colorScheme = event.target.value;
});

let form = document.querySelector('form');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  let data = new FormData(form);
  let url = form.action + '?';
  let params = [];
  for (let [name, value] of data) {
    params.push(`${name}=${encodeURIComponent(value)}`);
  }
  location.href = url + params.join('&');
});

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  if (projects.length === 0) {
    containerElement.innerHTML = '<p>No projects to show yet.</p>';
    return;
  }
  for (let project of projects) {
    const article = document.createElement('article');
    const title = project.url
      ? `<a href="${project.url}" target="_blank">${project.title}</a>`
      : project.title;
    article.innerHTML = `
      <${headingLevel}>${title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <div>
        <p>${project.description}</p>
        <p class="project-year">c. ${project.year}</p>
      </div>
    `;
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}