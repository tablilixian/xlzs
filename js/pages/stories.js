// ==================== Story Reader Page ====================
let _currentStoryId = null;
let _loadedCache = {};

function renderStoriesPage() {
  const container = document.getElementById('storiesContent');
  if (!container) return;

  // reset views
  document.getElementById('storiesListView').style.display = 'block';
  document.getElementById('storyReaderView').style.display = 'none';

  let html = '';

  // build chapter index
  STORIES_INDEX.forEach((story, i) => {
    const previewText = story.preview.length > 120
      ? story.preview.slice(0, 120) + '…'
      : story.preview;
    const chapterLabel = story.id === '00' ? '开篇' : '第 ' + story.id.replace(/^0/, '') + ' 章';
    html += `
      <div class="story-card" onclick="openStory('${story.id}')">
        <div class="story-card-number">${chapterLabel}</div>
        <div class="story-card-body">
          <div class="story-card-title">${story.title}</div>
          <div class="story-card-subtitle">${story.subtitle}</div>
          <div class="story-card-preview">${escapeHtml(previewText)}</div>
        </div>
        <div class="story-card-arrow">→</div>
      </div>
    `;
  });

  html += `
    <div class="story-footer-note">
      毕业旅行 · 五对情侣 · 七个昼夜<br>
      持续更新中
    </div>
  `;

  container.innerHTML = html;
}

function openStory(storyId) {
  const story = STORIES_INDEX.find(s => s.id === storyId);
  if (!story) return;

  _currentStoryId = storyId;

  // show reader, hide list
  document.getElementById('storiesListView').style.display = 'none';
  document.getElementById('storyReaderView').style.display = 'block';

  // set title
  const chapterLabel = story.id === '00' ? '开篇' : '第 ' + story.id.replace(/^0/, '') + ' 章';
  document.getElementById('storyReaderTitle').textContent = chapterLabel + ' · ' + story.title;

  // load content
  const contentEl = document.getElementById('storyReaderContent');
  contentEl.innerHTML = '<div class="story-loading">加载中…</div>';

  if (_loadedCache[storyId]) {
    renderStoryContent(contentEl, _loadedCache[storyId]);
    return;
  }

  fetch(story.file)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(text => {
      _loadedCache[storyId] = text;
      renderStoryContent(contentEl, text);
    })
    .catch(() => {
      contentEl.innerHTML = '<div class="story-error">加载失败。请通过 HTTP 服务器访问此页面（如 <code>python3 -m http.server 8000</code>）。</div>';
    });
}

function renderStoryContent(el, markdownText) {
  const lines = markdownText.split('\n');
  let html = '';
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // skip empty lines (will use paragraph breaks instead)
    if (trimmed === '') {
      html += '<div class="story-para-break"></div>';
      continue;
    }

    // horizontal rule
    if (trimmed === '---' || trimmed === '___') {
      html += '<hr class="story-hr">';
      continue;
    }

    // table row (simple detection)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        html += '<table class="story-table">';
        inTable = true;
      }
      const cells = trimmed.split('|').filter(c => c !== '');
      const isHeader = lines[i + 1] && lines[i + 1].trim().match(/^[\|\s\-:]+\|?$/);
      const tag = isHeader ? 'th' : 'td';
      html += '<tr>';
      cells.forEach(c => {
        const clean = inlineMarkdown(c.trim());
        html += `<${tag}>${clean}</${tag}>`;
      });
      html += '</tr>';
      if (isHeader) {
        i++; // skip the separator line
      }
      continue;
    }

    if (inTable && !trimmed.startsWith('|')) {
      html += '</table>';
      inTable = false;
    }

    // headings
    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = inlineMarkdown(hMatch[2]);
      html += `<h${level + 1} class="story-h${level + 1}">${text}</h${level + 1}>`;
      continue;
    }

    // bold list items: **text** — description
    const boldListItem = trimmed.match(/^\*\*(.+?)\*\*(.+)?/);
    if (boldListItem) {
      const bold = inlineMarkdown(boldListItem[1]);
      const rest = boldListItem[2] ? inlineMarkdown(boldListItem[2]) : '';
      html += `<div class="story-bold-item"><strong>${bold}</strong>${rest}</div>`;
      continue;
    }

    // regular paragraph
    html += `<p class="story-para">${inlineMarkdown(trimmed)}</p>`;
  }

  // close table if still open
  if (inTable) html += '</table>';

  el.innerHTML = html;
  el.scrollTop = 0;
}

function closeStoryReader() {
  document.getElementById('storiesListView').style.display = 'block';
  document.getElementById('storyReaderView').style.display = 'none';
  _currentStoryId = null;
}

function nextStory() {
  if (!_currentStoryId) return;
  const idx = STORIES_INDEX.findIndex(s => s.id === _currentStoryId);
  if (idx < STORIES_INDEX.length - 1) {
    openStory(STORIES_INDEX[idx + 1].id);
  }
}

function prevStory() {
  if (!_currentStoryId) return;
  const idx = STORIES_INDEX.findIndex(s => s.id === _currentStoryId);
  if (idx > 0) {
    openStory(STORIES_INDEX[idx - 1].id);
  }
}

// ==================== Helpers ====================
function inlineMarkdown(text) {
  let t = text;

  // bold: **text**
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // escape HTML entities
  t = escapeHtml(t);

  // inline code
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');

  return t;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
