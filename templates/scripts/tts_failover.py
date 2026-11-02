# Made By FALCREB
"""Home Assistant ses asistanı hattı için TTS yedekleme betiği.

EN: TTS failover for a Home Assistant voice assistant pipeline. Checks the primary
cloud TTS and moves the pipeline to a local fallback when it fails, then back when
it recovers. Prints a single JSON line to stdout.

Birincil bulut TTS'i test eder. Çalışıyorsa hattı birincil motorda tutar, çalışmıyorsa
yerel yedeğe geçirir, düzelince geri alır. Home Assistant içinden shell_command ile
çalışır ve websocket API'sine localhost üzerinden bağlanır. Token kod içinde değil,
secrets.yaml içindedir.

Kurulum / Setup:
    1. Bu dosyayı /config/scripts/tts_failover.py olarak kopyalayın.
    2. Aşağıdaki PIPELINE_NAME, PRIMARY ve FALLBACK değerlerini düzenleyin.
    3. secrets.yaml.example içindeki değerleri secrets.yaml dosyanıza ekleyin.

Birincil servis Azure değilse yalnızca primary_ok() işlevini değiştirin.
EN: for a provider other than Azure, only primary_ok() needs to change.
"""
import asyncio
import json
import re
import sys

import aiohttp  # Home Assistant ortamında zaten kurulu / bundled with Home Assistant

PIPELINE_NAME = "Example Assistant"
SECRETS_FILE = "/config/secrets.yaml"
HA_WS_URL = "http://localhost:8123/api/websocket"

# Motor, dil ve ses değerlerini kendi hattınıza göre ayarlayın.
# EN: set engine, language and voice to match your pipeline.
PRIMARY = {"tts_engine": "microsoft", "tts_language": "en-us", "tts_voice": None}
FALLBACK = {"tts_engine": "tts.piper", "tts_language": "en_US", "tts_voice": None}


def read_secret(name: str) -> str | None:
    """secrets.yaml içinden tek bir değeri okur (basit `anahtar: değer` satırları).

    Doldurulmamış CHANGE_ME değeri, hiç yazılmamış gibi kabul edilir.
    EN: an unfilled CHANGE_ME value counts as missing.
    """
    try:
        with open(SECRETS_FILE, encoding="utf-8") as f:
            for line in f:
                m = re.match(rf"^{re.escape(name)}:\s*['\"]?([^'\"#\r\n]+)['\"]?", line)
                if m:
                    value = m.group(1).strip()
                    return None if value == "CHANGE_ME" else value
    except OSError:
        return None
    return None


async def primary_ok(session: aiohttp.ClientSession) -> bool:
    """Azure Speech anahtarıyla kısa ömürlü token almayı dener.

    EN: tries to obtain a short-lived Azure Speech token with the configured key.
    """
    key, region = read_secret("tts_primary_key"), read_secret("tts_primary_region")
    if not key or not region:
        return False
    url = f"https://{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
    try:
        async with session.post(
            url,
            headers={"Ocp-Apim-Subscription-Key": key, "Content-Length": "0"},
            timeout=aiohttp.ClientTimeout(total=15),
        ) as r:
            return r.status == 200
    except (aiohttp.ClientError, asyncio.TimeoutError):
        return False


async def main() -> dict:
    token = read_secret("tts_failover_token")
    if not token:
        return {"ok": False, "error": "tts_failover_token is missing from secrets.yaml"}
    async with aiohttp.ClientSession() as session:
        healthy = await primary_ok(session)
        target = PRIMARY if healthy else FALLBACK
        async with session.ws_connect(HA_WS_URL) as ws:
            await ws.receive_json()
            await ws.send_json({"type": "auth", "access_token": token})
            if (await ws.receive_json()).get("type") != "auth_ok":
                return {"ok": False, "error": "websocket authentication failed"}

            await ws.send_json({"id": 1, "type": "assist_pipeline/pipeline/list"})
            pipelines = (await ws.receive_json())["result"]["pipelines"]
            pipeline = next((p for p in pipelines if p["name"] == PIPELINE_NAME), None)
            if pipeline is None:
                return {"ok": False, "error": f"pipeline not found: {PIPELINE_NAME}"}

            current = pipeline["tts_engine"]
            if current == target["tts_engine"]:
                return {"ok": True, "primary_healthy": healthy, "engine": current, "changed": False}

            update = {k: v for k, v in pipeline.items() if k != "id"} | target
            await ws.send_json({"id": 2, "type": "assist_pipeline/pipeline/update",
                                "pipeline_id": pipeline["id"], **update})
            res = await ws.receive_json()
            if not res.get("success"):
                return {"ok": False, "error": str(res.get("error"))}
            return {"ok": True, "primary_healthy": healthy, "engine": target["tts_engine"],
                    "changed": True, "previous": current}


if __name__ == "__main__":
    try:
        result = asyncio.run(main())
    except Exception as err:  # betik otomasyonu durdurmamalı / must never block the automation
        result = {"ok": False, "error": repr(err)}
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0)
