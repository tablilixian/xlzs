import requests
import json
import os

EDGE_TTS_URL = "http://localhost:5050/v1/audio/speech"
API_KEY = "your_api_key_here"
VOICE = "zh-CN-XiaoxiaoNeural"
OUTPUT_DIR = "../sounds/voices"
DEFAULT_SPEED = 0.9

VOICE_PROMPTS = [
    {"key": "coachOpen", "text": "语音教练已开启"},
    {"key": "testVoice", "text": "测试语音，你好，欢迎使用训练助手"},
    {"key": "pause", "text": "训练暂停"},
    {"key": "complete", "text": "恭喜，训练完成"},
    {"key": "start", "text": "训练开始，热身阶段"},
    {"key": "emergency", "text": "紧急刹车，开始冷却"},
    {"key": "restart", "text": "重新开始，回到热身阶段"},
    {"key": "phaseChange1", "text": "进入热身阶段"},
    {"key": "phaseChange2", "text": "进入爆发阶段"},
    {"key": "phaseChange3", "text": "进入控制阶段"},
]

PHASE_STATES = [
    {"key": "phase1_push", "text": "匀速推入"},
    {"key": "phase1_push2", "text": "继续深入"},
    {"key": "phase1_stop", "text": "深处停止"},
    {"key": "phase1_pull", "text": "匀速抽出"},
    {"key": "phase1_pull2", "text": "继续退出"},
    {"key": "phase1_entry", "text": "入口停止"},
    {"key": "phase2_sprint", "text": "全力冲刺"},
    {"key": "phase2_rest", "text": "停止休息"},
    {"key": "phase3_push", "text": "推入凯格尔"},
    {"key": "phase3_hold", "text": "保持收缩"},
    {"key": "phase3_pull", "text": "抽出放松"},
    {"key": "breath_inhale", "text": "深吸气"},
    {"key": "breath_hold", "text": "屏息保持"},
    {"key": "breath_exhale", "text": "深长呼气"},
    {"key": "arousal_guide", "text": "闭上眼睛，深呼吸，专注于身体的感觉，不用着急，准备好了再继续。"},
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