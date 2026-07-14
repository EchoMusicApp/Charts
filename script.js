const LASTFM_API_KEY = '4a9f5581a9cdf20a699f540ac52a95c9';
const audioPlayer = new Audio();
audioPlayer.volume = 0.5;
function getCachedData(key) {
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached);
  return null;
}
function setCachedData(key, data) {
  sessionStorage.setItem(key, JSON.stringify(data));
}
function initLiveScrobbleCounter() {
  const scrobbleEl = document.getElementById('stat-total-scrobbles');
  if (!scrobbleEl) return;
  let scrobbles = 143285903; 
  setInterval(() => {
    scrobbles += Math.floor(Math.random() * 80) + 20;
    scrobbleEl.innerHTML = `🌍 <strong>${scrobbles.toLocaleString()}</strong> Global Scrobbles`;
  }, 1000);
}
function openShareLink(query) {
  const url = `https:
  window.open(url, '_blank', 'noopener,noreferrer');
}
function renderSkeletons(containerId, count, colClasses) {
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = '';
  for(let i=0; i<count; i++) {
    const card = document.createElement('div');
    let extraClass = i === 0 ? 'col-span-2 flex-row' : (i === 5 ? 'col-span-3 flex-row' : '');
    card.className = `feature-card skeleton ${extraClass}`;
    card.innerHTML = `
      <div class="feature-icon-img" style="background: rgba(0,0,0,0.05);"></div>
      <div class="feature-content" style="width: 100%;">
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    `;
    container.appendChild(card);
  }
}
async function fetchItunesData(trackName, artistName) {
  let cleanTrackName = trackName ? trackName.replace(/\(.*?\)|\[.*?\]/g, '').split('-')[0].trim() : '';
  const query = encodeURIComponent((artistName || '') + ' ' + cleanTrackName).trim();
  const cacheKey = `itunes_${query}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  let result = { 
    art: 'data:image/svg+xml;utf8,<svg xmlns="http:
    previewUrl: null
  };
  try {
    const res = await fetch(`https:
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        result.art = data.results[0].artworkUrl100.replace('100x100bb', `300x300bb`);
        result.previewUrl = data.results[0].previewUrl || null;
      }
    }
  } catch (err) {
    console.warn("iTunes fetch error", err);
  }
  setCachedData(cacheKey, result);
  return result;
}
async function loadTracks(country = 'global') {
  renderSkeletons('charts-grid', 6);
  try {
    let url = `https:
    if (country !== 'global') {
      url = `https:
    }
    const res = await fetch(url);
    const data = await res.json();
    const tracks = data.tracks.track;
    const topTrack = tracks[0];
    const topItunes = await fetchItunesData(topTrack.name, topTrack.artist.name);
    document.getElementById('hero-img').src = topItunes.art.replace('300x300', '500x500');
    document.getElementById('hero-title').innerHTML = `${topTrack.name}<br><span class="display-lg" style="color: var(--muted); font-size: 48px;">${topTrack.artist.name}</span>`;
    document.getElementById('hero-stats').innerHTML = `Currently trending with <strong>${parseInt(topTrack.listeners).toLocaleString()}</strong> listeners.`;
    const exploreBtn = document.querySelector('.hero-ctas .btn-primary');
    if(exploreBtn) {
       const clone = exploreBtn.cloneNode(true);
       exploreBtn.parentNode.replaceChild(clone, exploreBtn);
       clone.addEventListener('click', (e) => {
         e.preventDefault();
         openShareLink(`${topTrack.artist.name} ${topTrack.name}`);
       });
       clone.innerText = "Listen Now";
    }
    const gridContainer = document.getElementById('charts-grid');
    gridContainer.innerHTML = '';
    const colorClasses = ['feature-card-1', 'feature-card-2', 'feature-card-3', 'feature-card-4', 'feature-card-5', 'feature-card-6'];
    for (let i = 1; i <= 6; i++) {
      const track = tracks[i];
      const itunes = await fetchItunesData(track.name, track.artist.name);
      const card = document.createElement('div');
      let extraClass = i === 1 ? 'col-span-2 flex-row' : (i === 6 ? 'col-span-3 flex-row' : '');
      card.className = `feature-card ${colorClasses[i-1]} ${extraClass}`;
      card.style.cursor = 'pointer';
      card.onclick = () => openShareLink(`${track.artist.name} ${track.name}`);
      if (itunes.previewUrl) {
          card.addEventListener('mouseenter', () => {
             audioPlayer.src = itunes.previewUrl;
             audioPlayer.play().catch(e=>console.log(e));
          });
          card.addEventListener('mouseleave', () => {
             audioPlayer.pause();
             audioPlayer.currentTime = 0;
          });
      }
      card.innerHTML = `
        <div style="position:relative;">
          <img class="feature-icon-img" src="${itunes.art}" alt="${track.name}">
        </div>
        <div class="feature-content">
          <h3 class="title-md" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${track.name}</h3>
          <p class="body-sm feature-body">${track.artist.name} • ${parseInt(track.listeners).toLocaleString()} Listeners</p>
        </div>
      `;
      gridContainer.appendChild(card);
    }
    if (country === 'global') {
        const marqueeWrapper = document.getElementById('marquee-wrapper');
        marqueeWrapper.innerHTML = ''; 
        const marqueeTracks = tracks.slice(7, 22);
        let marqueeHTML = '';
        for (const track of marqueeTracks) {
            const it = await fetchItunesData(track.name, track.artist.name);
            marqueeHTML += `
            <div class="phone-mockup-wrapper" onclick="openShareLink('${track.artist.name} ${track.name.replace(/'/g, "\\'")}')">
              <img src="${it.art}" class="phone-mockup" alt="${track.name}">
              <p class="caption" style="color: var(--muted); text-align: center; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.name}</p>
            </div>
            `;
        }
        for (let j = 0; j < 2; j++) {
            const group = document.createElement('div');
            group.className = 'marquee-group';
            group.innerHTML = marqueeHTML;
            marqueeWrapper.appendChild(group);
        }
    }
    observeFeatures();
  } catch (error) {
    console.error("Error fetching tracks:", error);
  }
}
async function loadArtistsAndAlbums() {
    renderSkeletons('artists-grid', 6);
    renderSkeletons('albums-grid', 6);
    try {
        const artistsRes = await fetch(`https:
        const artistsData = await artistsRes.json();
        const artists = artistsData.artists.artist;
        const colorClasses = ['feature-card-1', 'feature-card-2', 'feature-card-3', 'feature-card-4', 'feature-card-5', 'feature-card-6'];
        const artistsGrid = document.getElementById('artists-grid');
        artistsGrid.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const artist = artists[i];
            const itunes = await fetchItunesData('', artist.name); 
            const card = document.createElement('div');
            let extraClass = i === 0 ? 'col-span-2 flex-row' : (i === 5 ? 'col-span-3 flex-row' : '');
            card.className = `feature-card ${colorClasses[5-i]} ${extraClass}`;
            card.style.cursor = 'pointer';
            card.onclick = () => openShareLink(artist.name);
            card.innerHTML = `
              <img class="feature-icon-img" src="${itunes.art}" alt="${artist.name}" style="border-radius: 50%;">
              <div class="feature-content">
                <h3 class="title-md" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${artist.name}</h3>
                <p class="body-sm feature-body">${parseInt(artist.listeners).toLocaleString()} Listeners</p>
              </div>
            `;
            artistsGrid.appendChild(card);
        }
        const albumsGrid = document.getElementById('albums-grid');
        albumsGrid.innerHTML = '';
        const top2Artists = [artists[0], artists[1]];
        let albumIndex = 0;
        for (const topArtist of top2Artists) {
            const albumsRes = await fetch(`https:
            const albumsData = await albumsRes.json();
            const albums = albumsData.topalbums.album;
            for(const album of albums) {
                if(!album || !album.name) continue;
                const itunes = await fetchItunesData(album.name, topArtist.name);
                const card = document.createElement('div');
                let extraClass = albumIndex === 0 ? 'col-span-2 flex-row' : (albumIndex === 5 ? 'col-span-3 flex-row' : '');
                card.className = `feature-card ${colorClasses[albumIndex % 6]} ${extraClass}`;
                card.style.cursor = 'pointer';
                card.onclick = () => openShareLink(`${topArtist.name} ${album.name}`);
                card.innerHTML = `
                  <img class="feature-icon-img" src="${itunes.art}" alt="${album.name}" style="border-radius: 4px;">
                  <div class="feature-content">
                    <h3 class="title-md" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${album.name}</h3>
                    <p class="body-sm feature-body">${topArtist.name} • ${parseInt(album.playcount).toLocaleString()} Plays</p>
                  </div>
                `;
                albumsGrid.appendChild(card);
                albumIndex++;
            }
        }
        observeFeatures();
    } catch (e) {
        console.error("Error fetching artists/albums", e);
    }
}
async function loadTimeMachine() {
    renderSkeletons('time-grid', 6);
    try {
        const res = await fetch(`https:
        const data = await res.json();
        const tracks = data.tracks.track;
        const timeGrid = document.getElementById('time-grid');
        timeGrid.innerHTML = '';
        const colorClasses = ['feature-card-6', 'feature-card-5', 'feature-card-4', 'feature-card-3', 'feature-card-2', 'feature-card-1'];
        for (let i = 0; i < 6; i++) {
            const track = tracks[i];
            const itunes = await fetchItunesData(track.name, track.artist.name);
            const card = document.createElement('div');
            let extraClass = i === 0 ? 'col-span-2 flex-row' : (i === 5 ? 'col-span-3 flex-row' : '');
            card.className = `feature-card ${colorClasses[i]} ${extraClass}`;
            card.style.cursor = 'pointer';
            card.onclick = () => openShareLink(`${track.artist.name} ${track.name}`);
            if (itunes.previewUrl) {
                card.addEventListener('mouseenter', () => {
                   audioPlayer.src = itunes.previewUrl;
                   audioPlayer.play().catch(e=>console.log(e));
                });
                card.addEventListener('mouseleave', () => {
                   audioPlayer.pause();
                   audioPlayer.currentTime = 0;
                });
            }
            card.innerHTML = `
              <div style="position:relative;">
                <img class="feature-icon-img" src="${itunes.art}" alt="${track.name}" style="filter: sepia(0.3);">
              </div>
              <div class="feature-content">
                <h3 class="title-md" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${track.name}</h3>
                <p class="body-sm feature-body">${track.artist.name}</p>
              </div>
            `;
            timeGrid.appendChild(card);
        }
        observeFeatures();
    } catch(e) {
        console.error("Error loading time machine", e);
    }
}
async function loadGenre(genreTag = 'bollywood') {
    renderSkeletons('genre-grid', 6);
    try {
        const res = await fetch(`https:
        const data = await res.json();
        const tracks = data.tracks.track;
        const grid = document.getElementById('genre-grid');
        grid.innerHTML = '';
        const colorClasses = ['feature-card-2', 'feature-card-4', 'feature-card-6', 'feature-card-1', 'feature-card-3', 'feature-card-5'];
        for (let i = 0; i < 6; i++) {
            const track = tracks[i];
            const itunes = await fetchItunesData(track.name, track.artist.name);
            const card = document.createElement('div');
            let extraClass = i === 0 ? 'col-span-2 flex-row' : (i === 5 ? 'col-span-3 flex-row' : '');
            card.className = `feature-card ${colorClasses[i]} ${extraClass}`;
            card.style.cursor = 'pointer';
            card.onclick = () => openShareLink(`${track.artist.name} ${track.name}`);
            if (itunes.previewUrl) {
                card.addEventListener('mouseenter', () => {
                   audioPlayer.src = itunes.previewUrl;
                   audioPlayer.play().catch(e=>console.log(e));
                });
                card.addEventListener('mouseleave', () => {
                   audioPlayer.pause();
                   audioPlayer.currentTime = 0;
                });
            }
            card.innerHTML = `
              <div style="position:relative;">
                <img class="feature-icon-img" src="${itunes.art}" alt="${track.name}">
              </div>
              <div class="feature-content">
                <h3 class="title-md" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${track.name}</h3>
                <p class="body-sm feature-body">${track.artist.name}</p>
              </div>
            `;
            grid.appendChild(card);
        }
        observeFeatures();
    } catch(e) {
        console.error("Error loading genre", e);
    }
}
document.getElementById('region-filter').addEventListener('change', (e) => {
    loadTracks(e.target.value);
});
const genreFilter = document.getElementById('genre-filter');
if (genreFilter) {
    genreFilter.addEventListener('change', (e) => {
        loadGenre(e.target.value);
    });
}
function setupRipples() {
    function createRipple(event) {
      const button = event.currentTarget;
      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      let x, y;
      if (event.touches && event.touches.length > 0) {
        x = event.touches[0].clientX - button.getBoundingClientRect().left;
        y = event.touches[0].clientY - button.getBoundingClientRect().top;
      } else {
        x = event.clientX - button.getBoundingClientRect().left;
        y = event.clientY - button.getBoundingClientRect().top;
      }
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${x - radius}px`;
      circle.style.top = `${y - radius}px`;
      circle.classList.add("ripple-span");
      const existingRipple = button.querySelector('.ripple-span');
      if (existingRipple) existingRipple.remove();
      button.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    }
    document.querySelectorAll('.btn.ripple').forEach(btn => {
      btn.addEventListener('mousedown', createRipple);
      btn.addEventListener('touchstart', createRipple, {passive: true});
    });
}
window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const navbar = document.getElementById('navbar');
  if (currentScrollY > 150) {
    navbar.classList.add('visible');
  } else {
    navbar.classList.remove('visible');
  }
  const fabBubble = document.querySelector('.support-msg-bubble');
  const supportFab = document.getElementById('support-fab');
  const scrollPosition = window.scrollY + window.innerHeight;
  const bodyHeight = document.body.offsetHeight;
  const isNearBottom = scrollPosition > (bodyHeight - 50);
  if (supportFab) {
    supportFab.style.opacity = isNearBottom ? '0' : '1';
    const supportBtn = document.querySelector('.support-btn');
    if (supportBtn) supportBtn.style.pointerEvents = isNearBottom ? 'none' : 'auto';
  }
  if (currentScrollY > 50 && !isNearBottom) {
    if (fabBubble) fabBubble.classList.add('show');
    startTypeWriter();
  } else {
    if (fabBubble) fabBubble.classList.remove('show');
  }
}, {passive: true});
const typeText = document.getElementById('typewriter-text');
const msg = "Hi! If you love Echo Music, consider supporting my work! ☕";
let typeIndex = 0;
let hasTyped = false;
function typeWriter() {
  if (typeIndex < msg.length) {
    typeText.innerHTML += msg.charAt(typeIndex);
    typeIndex++;
    setTimeout(typeWriter, 40); 
  } else {
    setTimeout(() => { 
      const cursor = document.querySelector('.cursor');
      if (cursor) cursor.style.display = 'none'; 
    }, 2000);
  }
}
function startTypeWriter() {
  if (!hasTyped && typeText) {
    hasTyped = true;
    setTimeout(typeWriter, 300);
  }
}
function setupReveals() {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}
function observeFeatures() {
  const featureObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });
  document.querySelectorAll('.feature-card:not(.skeleton)').forEach((card, index) => {
    card.style.transitionDelay = `${index * 80}ms`;
    featureObserver.observe(card);
  });
}
initLiveScrobbleCounter();
setupRipples();
setupReveals();
loadTracks('global');
loadArtistsAndAlbums();
loadGenre('bollywood');
loadTimeMachine();