export default class DiaryClient {

    constructor({

        baseUrl = "http://127.0.0.1:8001",

        mock = false

    } = {}) {

        this.baseUrl = baseUrl;
        this.mock = mock;

        console.log("DiaryClient Loaded");
        console.log("Base URL:", this.baseUrl);

    }

    /**
     * Send handwritten page to backend.
     */
    async send(canvas) {

        if (!(canvas instanceof HTMLCanvasElement)) {

            throw new Error(
                "DiaryClient.send() expects a canvas."
            );

        }

        /*
         * Mock mode.
         * Allows testing the entire frontend without
         * running FastAPI.
         */
        if (this.mock) {

            await new Promise(resolve =>
                setTimeout(resolve, 1200)
            );

            return {

                transcript: "",

                reply:
                    "Welcome back, Pawan. The diary has been patiently waiting for your return."

            };

        }

        const blob = await this.canvasToBlob(canvas);

        const formData = new FormData();

        formData.append(

            "image",

            blob,

            "page.png"

        );

        let response;

        try {

            response = await fetch(

                `${this.baseUrl}/diary`,

                {

                    method: "POST",

                    body: formData

                }

            );

        }

        catch (_) {

            throw new Error(

                "Unable to reach WhisperInk backend."

            );

        }

        if (!response.ok) {

            let message =
                `HTTP ${response.status}`;

            try {

                const errorBody =
                    await response.json();

                if (errorBody.detail) {

                    message =
                        errorBody.detail;

                }

            }

            catch (_) {}

            throw new Error(message);

        }

        // ✅ Return the ACTUAL backend response
        const result = await response.json();

        console.log("Backend JSON:", result);

        return result;

    }

    /**
     * Convert canvas to PNG blob.
     */
    canvasToBlob(canvas) {

        return new Promise(

            (resolve, reject) => {

                canvas.toBlob(

                    blob => {

                        if (!blob) {

                            reject(

                                new Error(
                                    "Failed to create PNG."
                                )

                            );

                            return;

                        }

                        resolve(blob);

                    },

                    "image/png"

                );

            }

        );

    }

}