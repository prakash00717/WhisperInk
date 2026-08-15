import json
from pathlib import Path


class Memory:

    def __init__(self):

        self.directory = (
            Path(__file__).parent /
            "memories"
        )

        self.directory.mkdir(
            exist_ok=True
        )

        self.file = (
            self.directory /
            "memory.json"
        )

        if not self.file.exists():

            self.file.write_text(

                "[]",

                encoding="utf-8"

            )

    # --------------------------------------------------

    # Load memory

    # --------------------------------------------------

    def load(self):

        try:

            with open(

                self.file,

                "r",

                encoding="utf-8"

            ) as f:

                return json.load(f)

        except Exception:

            return []

    # --------------------------------------------------

    # Save memory

    # --------------------------------------------------

    def save(

        self,

        history

    ):

        with open(

            self.file,

            "w",

            encoding="utf-8"

        ) as f:

            json.dump(

                history,

                f,

                indent=4,

                ensure_ascii=False

            )

    # --------------------------------------------------

    # Append new conversation

    # --------------------------------------------------

    def append(

        self,

        user_text,

        diary_reply

    ):

        history = self.load()

        history.append(

            {

                "user": user_text,

                "diary": diary_reply

            }

        )

        # Keep only the latest 20 exchanges

        history = history[-20:]

        self.save(

            history

        )