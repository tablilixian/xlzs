import requests
import json
import os

EDGE_TTS_URL = "http://localhost:5050/v1/audio/speech"
API_KEY = "your_api_key_here"
VOICE = "zh-CN-XiaoxiaoNeural"
OUTPUT_DIR = "../sounds/voices"
DEFAULT_SPEED = 0.9

VOICE_PROMPTS = [
    {"key": "coachOpen", "text": "语音已开启"},
    {"key": "testVoice", "text": "测试语音，你好"},
    {"key": "pause", "text": "训练暂停"},
    {"key": "complete", "text": "训练完成"},
    {"key": "start", "text": "开始"},
    {"key": "emergency", "text": "紧急停止"},
    {"key": "restart", "text": "继续训练"},
    {"key": "phaseChange1", "text": "进入热身"},
    {"key": "phaseChange2", "text": "进入爆发"},
    {"key": "phaseChange3", "text": "进入控制"},
]

PHASE_STATES = [
    {"key": "phase1_push", "text": "推入"},
    {"key": "phase1_push2", "text": "深入"},
    {"key": "phase1_stop", "text": "停"},
    {"key": "phase1_pull", "text": "抽出"},
    {"key": "phase1_pull2", "text": "退出"},
    {"key": "phase1_entry", "text": "入口停"},
    {"key": "phase2_sprint", "text": "冲刺"},
    {"key": "phase2_rest", "text": "休息"},
    {"key": "phase3_push", "text": "推收"},
    {"key": "phase3_hold", "text": "保持"},
    {"key": "phase3_pull", "text": "抽放"},
    {"key": "breath_inhale", "text": "吸气"},
    {"key": "breath_hold", "text": "屏息"},
    {"key": "breath_exhale", "text": "呼气"},
    {"key": "arousal_guide", "text": "深呼吸，专注感受，准备好了再继续"},
]

def generate_voice(text, filename, speed=DEFAULT_SPEED):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    data = {
        "input": text,
        "voice": VOICE,
        "response_format": "mp3",
        "speed": speed
    }
    
    try:
        response = requests.post(EDGE_TTS_URL, headers=headers, json=data)
        if response.status_code == 200:
            with open(filename, "wb") as f:
                f.write(response.content)
            print(f"✓ Generated: {filename} (speed: {speed}x)")
            return True
        else:
            print(f"✗ Failed: {filename} - {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error: {filename} - {str(e)}")
        return False

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=== Generating system voice prompts ===")
    for prompt in VOICE_PROMPTS:
        filename = os.path.join(OUTPUT_DIR, f"{prompt['key']}.mp3")
        generate_voice(prompt["text"], filename)
    
    print("\n=== Generating phase state voices ===")
    for state in PHASE_STATES:
        filename = os.path.join(OUTPUT_DIR, f"{state['key']}.mp3")
        generate_voice(state["text"], filename)
    
    print("\n=== Generation complete ===")
    total_files = len(VOICE_PROMPTS) + len(PHASE_STATES)
    print(f"Total voices generated: {total_files}")
    print(f"\nGenerated voices are in: {os.path.abspath(OUTPUT_DIR)}")

if __name__ == "__main__":
    main()