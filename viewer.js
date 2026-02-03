const modeButtons = document.querySelectorAll('.mode-seg button');
const seasonField = document.getElementById('seasonField');
const episodeField = document.getElementById('episodeField');
const imdbInput = document.getElementById('imdb');
const seasonInput = document.getElementById('season');
const episodeInput = document.getElementById('episode');
const form = document.getElementById('playerForm');
const container = document.getElementById('playerContainer');
const placeholder = document.getElementById('placeholder');
const btnReset = document.getElementById('btn-reset');
const seriesControls = document.getElementById('seriesControls');
const btnPrevEp = document.getElementById('btn-prev-ep');
const btnNextEp = document.getElementById('btn-next-ep');

// datalist ids
const MOVIE_LIST_ID = 'imdbListMovies';
const SERIES_LIST_ID = 'imdbListSeries';

// Watched list storage (localStorage)
const MAX_MOVIES = 10;
const MAX_SERIES = 10;
// Title resolution disabled (CORS issues). Using IMDb IDs as labels.

const __DEBUG__ = true; // set to true to enable debug logs
const Base_URL_Sources = ["vidsrc-embed.ru" , "vidsrc-embed.su" , "vidsrcme.su" , "vsrc.su" ]

// Return a valid last source index (0..n-1)
function getLastSourceIndex(){
  try{
    const idx = parseInt(localStorage.getItem('last_source_index') || '0', 10);
    if(Number.isNaN(idx) || idx < 0 || idx >= Base_URL_Sources.length) return 0;
    return idx;
  }catch(e){ return 0; }
}

function setLastSourceIndex(idx){
  idx = parseInt(idx, 10) || 0;
  if(idx < 0) idx = 0;
  if(idx >= Base_URL_Sources.length) idx = Base_URL_Sources.length - 1;
  try{ localStorage.setItem('last_source_index', String(idx)); }catch(e){}
  source = Base_URL_Sources[idx];
  updateSourceUI();
  if(__DEBUG__) console.log('Source set to index', idx, source);
}

// UI helpers for source picker (elements are queried later)
let sourceButtons = null; 

function updateSourceUI(){
  // ensure elements are available
  sourceButtons = sourceButtons || document.querySelectorAll('.source-btn');
  const idx = Base_URL_Sources.indexOf(source);
  sourceButtons && sourceButtons.forEach(b=>{
    const bi = parseInt(b.dataset.index,10);
    const isActive = bi === idx;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    // label button with hostname for clarity
    b.textContent = Base_URL_Sources[bi] ? Base_URL_Sources[bi] : String(bi+1);
  });
}

// initialize source to saved index
let source = Base_URL_Sources[getLastSourceIndex()];

function getWatchedMovies(){
  try{ return JSON.parse(localStorage.getItem('watched_movies') || '[]'); }catch(e){ return []; }
}

function saveWatchedMovies(list){
  localStorage.setItem('watched_movies', JSON.stringify(list));
}

function addWatchedMovie(imdb, title){
  title = title || imdb;
  const list = getWatchedMovies().filter(i => i.imdb !== imdb);
  list.unshift({imdb, title, ts: Date.now()});
  if(list.length > MAX_MOVIES) list.length = MAX_MOVIES;
  saveWatchedMovies(list);
  populateDatalist();
}

function getWatchedSeries(){
  try{ return JSON.parse(localStorage.getItem('watched_series') || '[]'); }catch(e){ return []; }
}

function saveWatchedSeries(list){
  localStorage.setItem('watched_series', JSON.stringify(list));
}

function addWatchedSeries(imdb, title, season, episode){
  title = title || imdb;
  const list = getWatchedSeries().filter(i => i.imdb !== imdb);
  list.unshift({imdb, title, season, episode, ts: Date.now()});
  if(list.length > MAX_SERIES) list.length = MAX_SERIES;
  saveWatchedSeries(list);
  populateDatalist();
}

function getLastWatchedType(){
  try{
    let type = localStorage.getItem('last_watched_type') || 'movie';
    if (__DEBUG__){
      console.log('Got last watched type: ', type); 
    }
      return type;
  }
  catch(e){
    if (__DEBUG__){
      console.error('Error getting last watched type: ', e);
      console.log('Got last Default watched type: movie');
    }
    setLastWatchedType('movie');
    return 'movie';
  }
  
}

function setLastWatchedType(t){
  try{ localStorage.setItem('last_watched_type', t); }catch(e){}
  if (__DEBUG__) {
    console.log('Set last watched type to: ', t);
  }
    
}



/* IMDb title lookup removed due to CORS/unreliable endpoint.
   We use the IMDb ID itself as the label for watched items. */

function populateDatalist(){
  const dlMovies = document.getElementById(MOVIE_LIST_ID);
  const dlSeries = document.getElementById(SERIES_LIST_ID);
  if(dlMovies) dlMovies.innerHTML = '';
  if(dlSeries) dlSeries.innerHTML = '';
  const movies = getWatchedMovies();
  const series = getWatchedSeries();
  movies.forEach(m=>{
    const opt = document.createElement('option');
    opt.value = m.imdb;
    opt.label = m.title || m.imdb;
    dlMovies && dlMovies.appendChild(opt);
  });
  series.forEach(s=>{
    const opt = document.createElement('option');
    opt.value = s.imdb;
    opt.label = `${s.title || s.imdb} S${s.season}E${s.episode}`;
    dlSeries && dlSeries.appendChild(opt);
  });
}

function restoreOnMode(m){
  if (__DEBUG__){
    console.log('Restoring last watched item for mode: ', m);
  }
  if(m === 'movie'){
    const movies = getWatchedMovies();
    if(movies && movies.length && !imdbInput.value) imdbInput.value = movies[0].imdb;
    setLastWatchedType('movie');
  } else {
    const series = getWatchedSeries();
    if(series && series.length){
      const obj = series[0];
      if(!imdbInput.value) imdbInput.value = obj.imdb || '';
      if(!seasonInput.value) seasonInput.value = obj.season || '';
      if(!episodeInput.value) episodeInput.value = obj.episode || '';
    }
    setLastWatchedType('series');
  }
}

let mode = getLastWatchedType(); // 'movie' or 'series'
const IFRAME_TIMEOUT = 8000; // ms

function setMode(m){
  if(__DEBUG__){
    console.log('Setting mode to: ', m);
  } 
  mode = m;
  modeButtons.forEach(b=>{
    const isActive = b.dataset.mode === m;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  setLastWatchedType(m);

  const isSeries = (m === 'series');
  seasonField.style.display = isSeries ? 'block' : 'none';
  episodeField.style.display = isSeries ? 'block' : 'none';
  seriesControls.style.display = isSeries ? 'flex' : 'none';
  // switch suggestions source
  imdbInput.setAttribute('list', isSeries ? SERIES_LIST_ID : MOVIE_LIST_ID);

  // Make season/episode required only in series mode
  seasonInput.required = isSeries;
  episodeInput.required = isSeries;

  updateEpisodeControls();
}

modeButtons.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

if(btnReset){
  btnReset.addEventListener('click', () => {
    form.reset();
    setMode(mode);
    container.querySelector('iframe')?.remove();
    placeholder.style.display = 'flex';
    placeholder.textContent = 'Enter details and press Load to view';
  });
}

function updateEpisodeControls(){
  const ep = parseInt(episodeInput.value, 10);
  const epIsOne = isNaN(ep) ? true : ep <= 1;
  if(epIsOne){
    btnPrevEp.setAttribute('aria-disabled','true');
    btnPrevEp.classList.add('disabled');
  } else {
    btnPrevEp.setAttribute('aria-disabled','false');
    btnPrevEp.classList.remove('disabled');
  }
}

// Helper to create iframe and detect load / failure via timeout
function createAndAttachIframe(src){
  return new Promise((resolve, reject)=>{
    const old = container.querySelector('iframe');
    if(old) old.remove();

    const iframe = document.createElement('iframe');
    let settled = false;

    // show loading overlay while iframe is being fetched
    const loading = document.createElement('div');
    loading.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);background:linear-gradient(180deg,rgba(0,0,0,0.25),transparent)';
    loading.textContent = 'Loading…';
    container.appendChild(loading);

    // Attach iframe after loading element so it appears below overlay until load
    iframe.src = '';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'origin';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    container.appendChild(iframe);

    // timeout: mark as error and clean up
    const timeoutId = setTimeout(()=>{
      if(!settled){
        settled = true;
        cleanup();
        try{ iframe.remove(); } catch(e){}
        console.error('iframe load timeout for', src);
        // show friendly message
        placeholder.style.display = 'flex';
        placeholder.textContent = 'Timed out loading content.';
        reject(new Error('load timeout'));
      }
    }, IFRAME_TIMEOUT);

    function cleanup(){ try{ clearTimeout(timeoutId); loading.remove(); } catch(e){} }

    iframe.addEventListener('load', ()=>{
      if(settled) return;
      settled = true;
      cleanup();
      // hide placeholder and keep iframe visible
      try{ placeholder.style.display = 'none'; }catch(e){}
      console.log('iframe loaded:', src);
      resolve(iframe);
    });

    iframe.addEventListener('error', ()=>{
      if(settled) return;
      settled = true;
      cleanup();
      try{ iframe.remove(); } catch(e){}
      console.error('iframe error for', src);
      placeholder.style.display = 'flex';
      placeholder.textContent = 'Failed to load content (network or blocked).';
      reject(new Error('iframe error'));
    });

    // finally assign src (after listeners attached)
    console.log('Attaching iframe src:', src);
    iframe.src = src;
  });
}

async function loadSeriesAttempt(imdb, season, episode){
  if(!imdb){
    alert('Please enter IMDb ID first.');
    return Promise.reject(new Error('no imdb'));
  }
  const src = `https://${source}/embed/tv?imdb=${encodeURIComponent(imdb)}&season=${encodeURIComponent(season)}&episode=${encodeURIComponent(episode)}`;
  placeholder.style.display = 'none';
  try{
    await createAndAttachIframe(src);
    updateEpisodeControls();
    // store last series (imdb + season + episode) — using IMDb id as the label
    try{ addWatchedSeries(imdb, imdb, season, episode); }catch(e){}
    return {season, episode};
  }catch(err){
    // leave placeholder hidden as iframe will be removed; caller handles fallback
    return Promise.reject(err);
  }
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const imdb = imdbInput.value.trim();
  if(__DEBUG__){
    console.log('Form submitted with IMDb ID: ', imdb, ' Mode: ', mode, ' Source: ', source);
  }
  if(!imdb){ imdbInput.focus(); return; }

  if(mode === 'movie'){

    var src = `https://${source}/embed/movie?imdb=${encodeURIComponent(imdb)}`;
    placeholder.style.display = 'none';
    try{
      await createAndAttachIframe(src);
      // store last movie (use IMDb id as the label)
      try{ addWatchedMovie(imdb, imdb); }catch(e){}
    }catch(err){
      alert('Failed to load movie.');
    }
    return;
  }

  const season = seasonInput.value.trim();
  const episode = episodeInput.value.trim();
  if(!season || !episode){
    alert('Please enter season and episode for series.');
    return;
  }

  try{
    await loadSeriesAttempt(imdb, season, episode);
  }catch(err){
    alert('Episode might not be available.');
  }
});

// Prev episode: decrease episode (disabled when episode==1)
btnPrevEp.addEventListener('click', async ()=>{
  const imdb = imdbInput.value.trim();
  if(!imdb) return alert('Enter IMDb ID first');
  const season = parseInt(seasonInput.value,10) || 1;
  const episode = parseInt(episodeInput.value,10) || 1;
  if(episode <= 1) return; // keep disabled

  const newEpisode = episode - 1;
  episodeInput.value = newEpisode;
  try{
    await loadSeriesAttempt(imdb, season, newEpisode);
  }catch(err){
    alert('Failed to load previous episode.');
    // revert input
    episodeInput.value = episode;
  }
});

// Next episode: try currentSeason + next episode; if fails, try next season episode 1
btnNextEp.addEventListener('click', async ()=>{
  const imdb = imdbInput.value.trim();
  if(!imdb) return alert('Enter IMDb ID first');
  let season = parseInt(seasonInput.value,10) || 1;
  let episode = parseInt(episodeInput.value,10) || 1;

  const prevSeason = season, prevEpisode = episode;
  episode = episode + 1;
  episodeInput.value = episode;

  try{
    await loadSeriesAttempt(imdb, season, episode);
    return;
  }catch(err){
    // try next season episode 1
    season = season + 1;
    seasonInput.value = season;
    episodeInput.value = 1;
    try{
      await loadSeriesAttempt(imdb, season, 1);
      return;
    }catch(err2){
      // revert
      seasonInput.value = prevSeason;
      episodeInput.value = prevEpisode;
      alert('No content available for next episode or next season.');
    }
  }
});

// keep prev/next state updated when user changes episode/season manually
imdbInput.addEventListener('input', ()=>{});
seasonInput.addEventListener('input', updateEpisodeControls);
episodeInput.addEventListener('input', updateEpisodeControls);

// Start
setMode(mode);
populateDatalist();
restoreOnMode(mode);

// wire up source picker buttons
sourceButtons = document.querySelectorAll('.source-btn');
if(sourceButtons){
  sourceButtons.forEach(b=> b.addEventListener('click', ()=> setLastSourceIndex(parseInt(b.dataset.index,10))));
}
updateSourceUI();

// Allow pressing Enter on inputs to submit
imdbInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); form.dispatchEvent(new Event('submit')) } });
seasonInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); form.dispatchEvent(new Event('submit')) } });
episodeInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); form.dispatchEvent(new Event('submit')) } });
