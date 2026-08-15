import json
import os
import re
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()


class Gemini:

    def __init__(self):

        keys = [
            os.getenv("GEMINI_KEY_1"),
            os.getenv("GEMINI_KEY_2"),
            os.getenv("GEMINI_KEY_3"),
        ]

        self.clients = []

        for key in keys:
            if key:
                self.clients.append(genai.Client(api_key=key))

        if not self.clients:
            raise RuntimeError("No Gemini API keys found.")

        self.current_client = 0

        self.model = "gemini-3.5-flash"

        print(f"Gemini Ready! ({len(self.clients)} API key(s))")

    # ----------------------------------------------------------
    # Vision
    # ----------------------------------------------------------

    def ask(self, image_path, prompt):

        with open(image_path, "rb") as f:
            image_bytes = f.read()

        return self._generate(

            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type="image/png",
                ),
                prompt,
            ],

            schema={
                "type": "OBJECT",
                "properties": {
                    "transcript": {
                        "type": "STRING"
                    },
                    "reply": {
                        "type": "STRING"
                    }
                },
                "required": [
                    "transcript",
                    "reply"
                ]
            }

        )

    # ----------------------------------------------------------
    # Text-only (debug)
    # ----------------------------------------------------------

    def chat(self, prompt):

        return self._generate(

            contents=prompt,

            schema={
                "type": "OBJECT",
                "properties": {
                    "reply": {
                        "type": "STRING"
                    }
                },
                "required": [
                    "reply"
                ]
            }

        )

    # ----------------------------------------------------------
    # Shared request function
    # ----------------------------------------------------------

    def _generate(self, contents, schema):

        total_clients = len(self.clients)

        for offset in range(total_clients):

            index = (self.current_client + offset) % total_clients

            client = self.clients[index]

            try:

                response = client.models.generate_content(

                    model=self.model,

                    contents=contents,

                    config=types.GenerateContentConfig(

                        temperature=0.7,

                        response_mime_type="application/json",

                        response_schema=schema,

                    )

                )

                self.current_client = index

                print(f"Using Gemini Project #{index + 1}")

                return self._parse_json(response.text)

            except Exception as e:

                error = str(e)

                print(f"\nGemini Project #{index + 1} failed")
                print(error)

                # --------------------------------------------------
                # Quota exhausted -> switch project
                # --------------------------------------------------

                if "RESOURCE_EXHAUSTED" in error or "429" in error:

                    print("Switching to next Gemini project...\n")
                    continue

                # --------------------------------------------------
                # Temporary overload
                # --------------------------------------------------

                if "503" in error or "UNAVAILABLE" in error:

                    print("Gemini busy. Waiting 5 seconds...\n")

                    time.sleep(5)

                    try:

                        response = client.models.generate_content(

                            model=self.model,

                            contents=contents,

                            config=types.GenerateContentConfig(

                                temperature=0.7,

                                response_mime_type="application/json",

                                response_schema=schema,

                            )

                        )

                        self.current_client = index

                        return self._parse_json(response.text)

                    except Exception:

                        continue

                # Any other error should stop immediately
                raise

        raise RuntimeError(
            "All Gemini projects have exhausted their quota."
        )

    # ----------------------------------------------------------
    # JSON parser
    # ----------------------------------------------------------

    def _parse_json(self, text):

        text = text.strip()

        print("\n========== GEMINI RAW ==========")
        print(text)
        print("================================\n")

        try:
            return json.loads(text)

        except json.JSONDecodeError:
            pass

        text = re.sub(
            r"```json",
            "",
            text,
            flags=re.IGNORECASE,
        )

        text = text.replace("```", "").strip()

        try:
            return json.loads(text)

        except json.JSONDecodeError:
            pass

        match = re.search(
            r"\{.*\}",
            text,
            flags=re.DOTALL,
        )

        if match:

            try:
                return json.loads(match.group())

            except json.JSONDecodeError:
                pass

        raise RuntimeError(
            f"Gemini returned invalid JSON:\n\n{text}"
        )