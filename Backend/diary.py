from pathlib import Path

from gemini import Gemini
from memory import Memory
from prompt import PromptBuilder
import asyncio

class Diary:

    def __init__(self):

        self.gemini = Gemini()

        self.memory = Memory()

        self.prompt = PromptBuilder()

    async def process(self, image_path):

        retries = 3

        for attempt in range(retries):

            try:

                history = self.memory.load()

                prompt = self.prompt.build(history)

                result = self.gemini.ask(
                    image_path,
                    prompt
                )
                return result

            except Exception as e:

                print(f"\nGemini attempt {attempt + 1} failed:")
                print(e)

                # Last attempt -> graceful fallback
                if attempt == retries - 1:

                    return {

                        "transcript": "",

                        "reply":
                        (
                            "The diary grows quiet for a moment. "
                            "The ink refuses to flow... "
                            "Try asking me again in a little while."
                        )

                    }

                # Exponential backoff
                await asyncio.sleep(2 ** attempt)