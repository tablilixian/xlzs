#!/usr/bin/env python3
"""
TTS conversion script for arousal stories.
- Reads all v3-v6 story files
- Splits into individual stories, then into ~150-200 char chunks
- Uses local Edge TTS API (localhost:5050)
- Concatenates chunks with pydub/ffmpeg
- Retries on failure
- Outputs mapping table
"""

import os
import re
import sys
import json
import time
import subprocess
import shutil
import urllib.request
import argparse
from pathlib import Path

# ── ffmpeg via imageio ──
from imageio_ffmpeg import get_ffmpeg_exe

# ── config ──
TTS_URL = "http://localhost:5050/v1/audio/speech"
API_KEY = "your_api_key_here"
TTS_MODEL = "tts-1"
TTS_VOICE = "zh-CN-XiaoxiaoNeural"
TTS_SPEED = 0.95
OUTPUT_DIR = Path("/Users/wl/Desktop/job/learn/xlzs/sounds/voices/arousal_stories")
MAX_CHUNK_CHARS = 180
MAX_RETRIES = 5
RETRY_DELAY = 2

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = OUTPUT_DIR / "conversion_log.txt"
MAPPING_FILE = OUTPUT_DIR / "story_mapping.md"

# ── story files ──
STORY_FILES = [
    ("v3", "/Users/wl/Desktop/job/learn/xlzs/docs/arousal_stories_v3.md"),
    ("v4", "/Users/wl/Desktop/job/learn/xlzs/docs/arousal_stories_v4.md"),
    ("v5", "/Users/wl/Desktop/job/learn/xlzs/docs/arousal_stories_v5.md"),
    ("v6", "/Users/wl/Desktop/job/learn/xlzs/docs/arousal_stories_v6.md"),
]


def log(msg):
    timestamp = time.strftime("[%H:%M:%S]")
    line = f"{timestamp} {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


# ── parse stories from markdown ──
def parse_stories(filepath, version_tag):
    """Parse a markdown file into list of (title, text) tuples."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    stories = []
    parts = re.split(r'\n##\s+', content)
    for pi, part in enumerate(parts):
        lines = part.strip().split('\n')
        if not lines:
            continue
        title = lines[0].strip('# ')
        text_lines = []
        for line in lines[1:]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and stripped != '---':
                text_lines.append(stripped)
        text = '\n'.join(text_lines).strip()
        # Skip file-level intro/frontmatter (first part, usually short, no story markers)
        if pi == 0 and len(text) < 200:
            continue
        if text and len(text) > 100:
            stories.append((title, text))
    return stories


# ── smart chunking ──
def split_into_chunks(text, max_chars=MAX_CHUNK_CHARS):
    """Split text into chunks at sentence boundaries."""
    # First split by paragraphs
    paragraphs = re.split(r'\n\s*\n', text)
    chunks = []
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(para) <= max_chars:
            chunks.append(para)
            continue
        # Split long paragraphs by sentence
        sentences = re.split(r'(?<=[。！？\n])', para)
        current = ""
        for sent in sentences:
            if not sent.strip():
                continue
            if len(current) + len(sent) <= max_chars:
                current += sent
            else:
                if current.strip():
                    chunks.append(current.strip())
                current = sent
        if current.strip():
            chunks.append(current.strip())
    return chunks


# ── TTS call ──
def tts_speech(text, idx, total_chunks, story_name):
    """Call TTS API, return audio bytes."""
    data = json.dumps({
        "model": TTS_MODEL,
        "input": text,
        "voice": TTS_VOICE,
        "response_format": "mp3",
        "speed": TTS_SPEED,
    }).encode('utf-8')

    req = urllib.request.Request(
        TTS_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
        method="POST"
    )

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                audio_bytes = resp.read()
                if len(audio_bytes) < 100:
                    raise Exception(f"Audio too small: {len(audio_bytes)} bytes")
                return audio_bytes
        except Exception as e:
            log(f"  ⚠ [{idx}/{total_chunks}] Attempt {attempt}/{MAX_RETRIES} failed: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY * attempt)
            else:
                raise


# ── process a single story ──
def process_story(version_tag, story_idx, title, text):
    """Convert one story to audio file. Returns (filename, success)."""
    safe_title = re.sub(r'[^\w\u4e00-\u9fff]', '_', title)[:30]
    filename = f"story_{version_tag}_{story_idx:02d}.mp3"
    filepath = OUTPUT_DIR / filename
    temp_dir = OUTPUT_DIR / f"temp_{version_tag}_{story_idx:02d}"
    temp_dir.mkdir(exist_ok=True)

    log(f"\n{'='*60}")
    log(f"Processing [{version_tag}] Story #{story_idx}: {title}")
    log(f"  Output: {filename}")

    chunks = split_into_chunks(text)
    log(f"  Chunks: {len(chunks)}")

    chunk_files = []
    success = True

    for ci, chunk_text in enumerate(chunks):
        chunk_filename = f"chunk_{ci:04d}.mp3"
        chunk_path = temp_dir / chunk_filename
        label = f"{ci+1}/{len(chunks)}"

        # Skip if already exists
        if chunk_path.exists() and os.path.getsize(chunk_path) > 500:
            chunk_files.append(str(chunk_path))
            continue

        try:
            audio_bytes = tts_speech(chunk_text, label, len(chunks), title)
            with open(chunk_path, "wb") as f:
                f.write(audio_bytes)
            chunk_files.append(str(chunk_path))
            log(f"  ✓ [{label}] {len(chunk_text)} chars -> {len(audio_bytes)} bytes")
        except Exception as e:
            log(f"  ✗ [{label}] FAILED after {MAX_RETRIES} retries: {e}")
            success = False
            break

    if success and chunk_files:
        log(f"  Concatenating {len(chunk_files)} chunks...")
        try:
            ffmpeg = get_ffmpeg_exe()
            # Build concat demuxer file list
            list_path = temp_dir / "concat_list.txt"
            with open(list_path, "w") as f:
                for cf in chunk_files:
                    f.write(f"file '{os.path.abspath(cf)}'\n")
            cmd = [
                ffmpeg, "-y", "-f", "concat", "-safe", "0",
                "-i", str(list_path),
                "-c", "libmp3lame", "-b:a", "64k",
                str(filepath)
            ]
            subprocess.run(cmd, capture_output=True, check=True)
            file_size = os.path.getsize(filepath)
            # Get duration via ffmpeg probe
            probe = subprocess.run(
                [ffmpeg, "-i", str(filepath), "-hide_banner"],
                capture_output=True, text=True
            )
            dur_match = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', probe.stderr)
            if dur_match:
                h, m, s = dur_match.groups()
                duration = int(h)*3600 + int(m)*60 + float(s)
            else:
                duration = 0
            log(f"  ✓ Done: {filename} ({file_size/1024:.0f} KB, {duration:.0f}s)")
        except Exception as e:
            log(f"  ✗ Concatenation failed: {e}")
            success = False

    # Cleanup temp
    import shutil
    if temp_dir.exists():
        shutil.rmtree(temp_dir)

    return filename, success


# ── main ──
def main():
    # Clear log
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        f.write("# TTS Conversion Log\n")
        f.write(f"# Started: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"# Voice: {TTS_VOICE}, Speed: {TTS_SPEED}\n\n")

    all_results = []

    for version_tag, filepath in STORY_FILES:
        log(f"\n{'='*60}")
        log(f"Loading {version_tag}: {filepath}")
        stories = parse_stories(filepath, version_tag)
        log(f"  Found {len(stories)} stories")

        for si, (title, text) in enumerate(stories, 1):
            filename, success = process_story(version_tag, si, title, text)
            all_results.append({
                "version": version_tag,
                "index": si,
                "title": title,
                "filename": filename,
                "success": success,
                "filepath": str(OUTPUT_DIR / filename) if success else "",
            })

    # ── generate mapping ──
    log(f"\n{'='*60}")
    log("Generating mapping table...")

    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        f.write("# 激情小说 · 语音文件对应表\n\n")
        f.write(f"> 生成时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"> 语音: {TTS_VOICE} | 速度: {TTS_SPEED}\n")
        f.write(f"> 文件位置: `{OUTPUT_DIR}`\n\n")

        f.write("| # | 文件 | 版本 | 标题 | 状态 |\n")
        f.write("|---|------|------|------|------|\n")

        success_count = 0
        for r in all_results:
            status = "✅" if r["success"] else "❌"
            if r["success"]:
                success_count += 1
            f.write(f"| {r['version']}-{r['index']:02d} | `{r['filename']}` | {r['version']} | {r['title']} | {status} |\n")

        f.write(f"\n\n---\n\n**统计**: 共 {len(all_results)} 篇, 成功 {success_count} 篇, 失败 {len(all_results) - success_count} 篇\n")

        # Detailed log
        f.write("\n\n## 详细日志\n\n")
        with open(LOG_FILE, "r", encoding="utf-8") as lf:
            f.write("```\n")
            f.write(lf.read())
            f.write("```\n")

    log(f"Mapping written to {MAPPING_FILE}")
    log(f"Results: {success_count}/{len(all_results)} successful")

    # Print summary
    print(f"\n{'='*60}")
    print(f"  ALL DONE: {success_count}/{len(all_results)} stories converted successfully")
    print(f"  Mapping: {MAPPING_FILE}")
    print(f"  Output:  {OUTPUT_DIR}")
    print(f"{'='*60}")

    return 0 if success_count == len(all_results) else 1


if __name__ == "__main__":
    sys.exit(main())
