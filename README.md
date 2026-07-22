# xlzs
训练助手

## 语音系统文档

### 技术栈
- **TTS**: Edge TTS（本地 Docker: `travisvn/openai-edge-tts`，端口 5050）
- **API**: OpenAI-compatible `/v1/audio/speech`，voice: `zh-CN-XiaoxiaoNeural`
- **API Key**: `your_api_key_here`
- **存储**: `sounds/voices/*.mp3`

### 阶段播报逻辑

#### 唤醒阶段（阶段 0）
- 显示节拍器脉动（60 BPM），配合轻微震动
- 唤醒故事轮流播放（5 篇，间隔 3 秒循环），帮助快速勃起
- 故事文字 ↔ MP3：

| 标题 | 文件 |
|---|---|
| 温柔爱抚 | `arousal_story_1.mp3` |
| 隐秘欲望 | `arousal_story_2.mp3` |
| 感官觉醒 | `arousal_story_3.mp3` |
| 征服与臣服 | `arousal_story_4.mp3` |
| 梦幻缠绵 | `arousal_story_5.mp3` |

- 用户手动点击"已唤醒"后进入训练

#### 热身阶段（阶段 1）
- 仅播 1/3/4/6 拍（跳过第 2 拍"深入"、第 5 拍"退出"）
- 文字 ↔ MP3 对应：

| 拍 | 文字 | 文件 |
|---|---|---|
| 1 | 匀速推入 | `phase1_push.mp3` |
| 2 | 深入 | `phase1_push2.mp3`（不播） |
| 3 | 停 | `phase1_stop.mp3` |
| 4 | 匀速抽出 | `phase1_pull.mp3` |
| 5 | 退出 | `phase1_pull2.mp3`（不播） |
| 6 | 入口停 | `phase1_entry.mp3` |

#### 爆发阶段（阶段 2）
- 冲刺：每冲刺周期在 0s/5s/10s 播"冲"（`phase2_sprint.mp3`），共 3 次
- 休息：进入休息时播一次"休息一下"（`phase2_rest.mp3`）

#### 控制阶段（阶段 3）
- 3 拍循环
- 文字 ↔ MP3 对应：

| 拍 | 文字 | 文件 |
|---|---|---|
| 0 | 插入并收紧 | `phase3_push.mp3` |
| 1 | 保持 | `phase3_hold.mp3` |
| 2 | 抽出并放松 | `phase3_pull.mp3` |

### 其他语音

| 触发时机 | 文字 | 文件 |
|---|---|---|
| 开启语音教练 | 语音已开启 | `coachOpen.mp3` |
| 测试语音 | 测试语音，你好 | `testVoice.mp3` |
| 暂停训练 | 训练暂停 | `pause.mp3` |
| 训练完成 | 恭喜你完成训练 | `complete.mp3` |
| 阶段开始 | {阶段名}开始 | `start.mp3` |
| 紧急停止 | 紧急停止 | `emergency.mp3` |
| 从控射暂停恢复 | 继续，{阶段名} | `restart.mp3` |
| 阶段切换 | 进入{阶段名} | `phaseChange1/2/3.mp3` |

### 重语音方法
```bash
curl -X POST http://localhost:5050/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key_here" \
  -d '{"input":"要转的文字","voice":"zh-CN-XiaoxiaoNeural","response_format":"mp3","speed":1.0}' \
  -o sounds/voices/xxx.mp3
```
