import uuid
from datetime import datetime
from os import getenv
import ffmpeg
import functions_framework
from google.cloud import secretmanager
from googleapiclient.discovery import build
from openai import OpenAI

doc_id = getenv("G_DOC_ID")
local_mp3_file_path = "/tmp/latest_uploaded_mp3_file.mp3"


def mp3_conversion(audio_bytes):
    with open("/tmp/latest_uploaded_mp3_file.mp3", "wb") as f:
        f.write(audio_bytes)
    try:
        print("in mp3 conversion")
        output_file_path = f"/tmp/{uuid.uuid4()}.mp3"
        stream = ffmpeg.input("/tmp/latest_uploaded_mp3_file.mp3")
        stream = ffmpeg.output(stream, output_file_path, format="mp3")
        ffmpeg.run(stream, capture_stdout=True, capture_stderr=True)
    except ffmpeg.Error as e:
        print("stdout:", e.stdout)
        print("stderr:", e.stderr)
        raise e
    return output_file_path


def openai_transcript(output_file_path: str, open_ai_secret_key):
    try:
        client = OpenAI(api_key=open_ai_secret_key)
        with open(output_file_path, "rb") as f:
            transcript = client.audio.transcriptions.create(model="whisper-1", file=f)
        return transcript.text
    except Exception as e:
        print(f"An error occurred in openai_transcript: {e}")
        return None


def append_to_google_doc(doc_id, text_result):
    service = build("docs", "v1")
    date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    body = {
        "requests": [
            {
                "insertText": {
                    "location": {"index": 1},
                    "text": f"{date}\n{text_result}\n\n",
                }
            }
        ]
    }
    service.documents().batchUpdate(documentId=doc_id, body=body).execute()


@functions_framework.http
def start(request):
    project_id = "dear-diary-app-401220"
    secret_id = "openai_api_key"
    version_id = "latest"
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    client = secretmanager.SecretManagerServiceClient()
    response = client.access_secret_version(request={"name": name})
    open_ai_secret_key = response.payload.data.decode("UTF-8")
    res = {"status": ""}
    text_result = None
    try:
        audio_bytes = request.get_data()
        output_file_path = mp3_conversion(audio_bytes)
        text_result = openai_transcript(output_file_path, open_ai_secret_key)
        res["status"] = "the document has been updated"
    except Exception as e:
        res["status"] = "request failed"
    if text_result is not None:
        append_to_google_doc(doc_id, text_result)

    return res
