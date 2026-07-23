// ==================== Story Reader Page ====================
let _currentStoryId = null;
let _loadedCache = {};
let _currentNavIndex = -1; // index in flat STORIES_INDEX

function renderStoriesPage() {
  const container = document.getElementById('storiesContent');
  if (!container) return;

  // reset views
  document.getElementById('storiesListView').style.display = 'block';
  document.getElementById('storyReaderView').style.display = 'none';

  let html = '';

  STORIES_CATEGORIES.forEach((cat, ci) => {
    html += `
      <div class="story-category">
        <div class="story-category-header">
          <span class="story-category-name">${cat.name}</span>
          <span class="story-category-desc">${cat.desc}</span>
        </div>
    `;

    cat.stories.forEach(story => {
      const previewText = story.preview.length > 100
        ? story.preview.slice(0, 100) + '…'
        : story.preview;
      html += `
        <div class="story-card" onclick="openStory('${story.id}')">
          <div class="story-card-body">
            <div class="story-card-title">${story.title}</div>
            <div class="story-card-subtitle">${story.subtitle}</div>
            <div class="story-card-preview">${escapeHtml(previewText)}</div>
          </div>
          <div class="story-card-arrow">→</div>
        </div>
      `;
    });

    html += `</div>`;
  });

  html += `<div class="story-footer-note">持续更新中</div>`;

  container.innerHTML = html;
}

function openStory(storyId) {
  const story = STORIES_INDEX.find(s => s.id === storyId);
  if (!story) return;

  _currentStoryId = storyId;
  _currentNavIndex = STORIES_INDEX.findIndex(s => s.id === storyId);

  document.getElementById('storiesListView').style.display = 'none';
  document.getElementById('storyReaderView').style.display = 'block';

  document.getElementById('storyReaderTitle').textContent = story.title;

  // update nav buttons
  document.getElementById('prevStoryBtn').style.visibility = _currentNavIndex > 0 ? 'visible' : 'hidden';
  document.getElementById('nextStoryBtn').style.visibility = _currentNavIndex < STORIES_INDEX.length - 1 ? 'visible' : 'hidden';

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

    if (trimmed === '') {
      html += '<div class="story-para-break"></div>';
      continue;
    }

    if (trimmed === '---' || trimmed === '___') {
      html += '<hr class="story-hr">';
      continue;
    }

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
      if (isHeader) i++;
      continue;
    }

    if (inTable && !trimmed.startsWith('|')) {
      html += '</table>';
      inTable = false;
    }

    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = inlineMarkdown(hMatch[2]);
      html += `<h${level + 1} class="story-h${level + 1}">${text}</h${level + 1}>`;
      continue;
    }

    // blockquote: > text
    if (trimmed.startsWith('> ')) {
      html += `<div class="story-blockquote">${inlineMarkdown(trimmed.slice(2))}</div>`;
      continue;
    }

    const boldListItem = trimmed.match(/^\*\*(.+?)\*\*(.+)/);
    if (boldListItem) {
      const bold = inlineMarkdown(boldListItem[1]);
      const rest = inlineMarkdown(boldListItem[2]);
      html += `<div class="story-bold-item"><strong>${bold}</strong>${rest}</div>`;
      continue;
    }

    // bullet list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      html += `<div class="story-list-item">${inlineMarkdown(trimmed.slice(2))}</div>`;
      continue;
    }

    html += `<p class="story-para">${inlineMarkdown(trimmed)}</p>`;
  }

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
  if (_currentNavIndex < STORIES_INDEX.length - 1) {
    openStory(STORIES_INDEX[_currentNavIndex + 1].id);
  }
}

function prevStory() {
  if (_currentNavIndex > 0) {
    openStory(STORIES_INDEX[_currentNavIndex - 1].id);
  }
}

// ==================== Helpers ====================
function inlineMarkdown(text) {
  let t = text;
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // inline code before html escape
  t = t.replace(/`([^`]+)`/g, '\x00CODE:$1\x00');
  t = escapeHtml(t);
  t = t.replace(/\x00CODE:([^]+?)\x00/g, '<code>$1</code>');
  return t;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
