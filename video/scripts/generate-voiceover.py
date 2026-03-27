#!/usr/bin/env python3
"""
Generate voiceover segments using Azure TTS.
Requires: pip install azure-cognitiveservices-speech
Set env: AZURE_SPEECH_KEY and AZURE_SPEECH_REGION
"""

import os
import sys

try:
    import azure.cognitiveservices.speech as speechsdk
except ImportError:
    print("Installing azure-cognitiveservices-speech...")
    os.system(f"{sys.executable} -m pip install azure-cognitiveservices-speech")
    import azure.cognitiveservices.speech as speechsdk

SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY", "")
SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION", "eastus")

if not SPEECH_KEY:
    print("ERROR: Set AZURE_SPEECH_KEY environment variable")
    print("Get a free key at: https://portal.azure.com → Cognitive Services → Speech")
    sys.exit(1)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "voiceover")
os.makedirs(OUT_DIR, exist_ok=True)

# Scene segments with timing (seconds from start)
# Voice: en-NG-AbeoNeural (Nigerian English male)
VOICE = "en-NG-EzinneNeural"  # Nigerian English female

SEGMENTS = [
    {
        "name": "01-hook",
        "start_sec": 0,
        "text": "DeFi is intimidating. The jargon, the risk, the complexity. It keeps millions of users from ever going on chain. And blockchain games? Most of them feel like token farms with no real gameplay.",
    },
    {
        "name": "02-reveal",
        "start_sec": 10,
        "text": "What if learning DeFi felt like a board game? Introducing OneBoard. A Monopoly style game where every property is a real OneChain protocol.",
    },
    {
        "name": "03-connect",
        "start_sec": 18,
        "text": "Connect your OneWallet and start a game. Every action, from creating the game to rolling dice, is a signed transaction on OneChain.",
    },
    {
        "name": "04-gameplay",
        "start_sec": 38,
        "text": "Roll dice to move around 16 spaces. Buy real protocols like OneDEX and OCT Staking. Each purchase mints a dynamic NFT. Three AI opponents powered by Groq's Llama model trash talk you in real time, each with a unique personality and strategy.",
    },
    {
        "name": "05-pvp",
        "start_sec": 68,
        "text": "Want to play with friends? Create a lobby, share the game ID, and compete on chain. Two to four players, fully decentralized.",
    },
    {
        "name": "06-features",
        "start_sec": 80,
        "text": "Every board space teaches you something. Buying OneDEX teaches you what a DEX is. Getting rug pulled teaches you the risks. The gameplay is the education.",
    },
    {
        "name": "07-architecture",
        "start_sec": 95,
        "text": "Five Move smart contracts handle all game logic on chain. Next.js frontend with OneWallet integration. Groq for AI decisions and trash talk.",
    },
    {
        "name": "08-close",
        "start_sec": 105,
        "text": "OneBoard. The DeFi board game on OneChain. Try it now at oneboard mauve dot vercel dot app. Built for OneHack 3.0.",
    },
]


def generate_segment(segment):
    speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
    speech_config.speech_synthesis_voice_name = VOICE
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    )

    out_path = os.path.join(OUT_DIR, f"{segment['name']}.mp3")
    audio_config = speechsdk.audio.AudioOutputConfig(filename=out_path)

    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config, audio_config=audio_config
    )

    # Use SSML for better control
    ssml = f"""
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-NG">
        <voice name="{VOICE}">
            <prosody rate="-5%" pitch="-2%">
                {segment['text']}
            </prosody>
        </voice>
    </speak>
    """

    result = synthesizer.speak_ssml_async(ssml).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print(f"  Generated: {segment['name']}.mp3")
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation = result.cancellation_details
        print(f"  FAILED: {segment['name']} - {cancellation.reason}")
        if cancellation.error_details:
            print(f"    Error: {cancellation.error_details}")


def combine_segments():
    """Combine all segments into a single voiceover track using ffmpeg."""
    inputs = []
    filter_parts = []

    for i, seg in enumerate(SEGMENTS):
        mp3_path = os.path.join(OUT_DIR, f"{seg['name']}.mp3")
        if not os.path.exists(mp3_path):
            print(f"  Skipping missing: {seg['name']}.mp3")
            continue
        inputs.append(f'-i "{mp3_path}"')
        delay_ms = seg["start_sec"] * 1000
        filter_parts.append(f"[{i}]adelay={delay_ms}|{delay_ms}[d{i}]")

    if not inputs:
        print("No segments to combine!")
        return

    mix_inputs = "".join(f"[d{i}]" for i in range(len(inputs)))
    filter_parts.append(
        f"{mix_inputs}amix=inputs={len(inputs)}:duration=longest:dropout_transition=0[out]"
    )

    filter_str = ";".join(filter_parts)
    out_path = os.path.join(OUT_DIR, "voiceover-combined.mp3")
    cmd = f'ffmpeg -y {" ".join(inputs)} -filter_complex "{filter_str}" -map "[out]" "{out_path}"'
    print(f"\n  Combining {len(inputs)} segments...")
    os.system(cmd)
    print(f"  Output: {out_path}")


if __name__ == "__main__":
    print(f"Generating voiceover with Azure TTS ({VOICE})...")
    print(f"Region: {SPEECH_REGION}")
    print()

    for seg in SEGMENTS:
        generate_segment(seg)

    print()
    combine_segments()

    print()
    print("Done! Next steps:")
    print("  1. Render video: npx remotion render src/index.ts OneBoardDemo out/oneboard-demo.mp4")
    print('  2. Merge audio:  ffmpeg -y -i out/oneboard-demo.mp4 -i voiceover/voiceover-combined.mp3 -c:v copy -c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -shortest out/oneboard-final.mp4')
