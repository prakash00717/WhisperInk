import SessionManager from "./SessionManager.js";

import BackgroundRenderer from "./drawing/BackgroundRenderer.js";
import PenRenderer from "./drawing/PenRenderer.js";
import DiaryRenderer from "./drawing/DiaryRenderer.js";

import DiaryClient from "./network/DiaryClient.js";
import ReplyAnimator from "./reply/ReplyAnimator.js";

export default class Paper {

    constructor(canvas) {

        this.canvas = canvas;

        this.ctx = canvas.getContext("2d");

        this.dpr = window.devicePixelRatio || 1;

        this.background = null;
        this.pen = null;
        this.diary = null;

        this.session = null;
        this.client = null;
        this.replyAnimator = null;

        // Keep track of the render loop so it can be cancelled later.
        this.animationFrame = null;

        this.initialize();

    }

    initialize() {

        this.resize();

        this.background =
            new BackgroundRenderer(this.canvas);

        this.pen =
            new PenRenderer();

        this.diary =
            new DiaryRenderer();

        this.client =
            new DiaryClient();

        this.replyAnimator =
            new ReplyAnimator(this.diary);

        this.session =
            new SessionManager({

                idleTimeout: 2000,

                onSessionComplete: session => {

                    this.handleSessionComplete(session);

                }

            });

        this.bindEvents();

        this.render();
        window.paper = this;

    }

    bindEvents() {

        this.canvas.addEventListener(

            "pointerdown",

            e => this.onPointerDown(e)

        );

        this.canvas.addEventListener(

            "pointermove",

            e => this.onPointerMove(e)

        );

        window.addEventListener(

            "pointerup",

            e => this.onPointerUp(e)

        );

        window.addEventListener(

            "resize",

            () => this.resize()

        );

    }

    resize() {

        const rect =
            this.canvas.getBoundingClientRect();

        this.canvas.width =
            rect.width * this.dpr;

        this.canvas.height =
            rect.height * this.dpr;

        this.ctx.setTransform(

            this.dpr,

            0,

            0,

            this.dpr,

            0,

            0

        );

        if (this.background) {

            this.background.resize();

        }

    }

    render() {

        const width =
            this.canvas.width / this.dpr;

        const height =
            this.canvas.height / this.dpr;

        this.ctx.clearRect(

            0,

            0,

            width,

            height

        );

        this.background.draw(

            this.ctx

        );

        this.pen.draw(

            this.ctx

        );

        this.diary.draw(

            this.ctx,
            width

        );

        this.animationFrame =
            requestAnimationFrame(

                () => this.render()

            );

    }

    destroy() {

        if (this.animationFrame !== null) {

            cancelAnimationFrame(

                this.animationFrame

            );

            this.animationFrame = null;

        }

    }

    getPressure(event) {

        return event.pressure > 0
            ? event.pressure
            : 0.5;

    }

    onPointerDown(event) {

        event.preventDefault();

        this.canvas.setPointerCapture(

            event.pointerId

        );

        const point =
            this.getCanvasPoint(event);

        this.session.beginStroke(

            point.x,

            point.y,

            this.getPressure(event)

        );

        this.pen.setStrokes(

            this.session.getRenderableStrokes()

        );

    }

    onPointerMove(event) {

        if (!this.session.isWriting) {

            return;

        }

        event.preventDefault();

        const point =
            this.getCanvasPoint(event);

        this.session.updateStroke(

            point.x,

            point.y,

            this.getPressure(event)

        );

        this.pen.setStrokes(
            this.session.getRenderableStrokes()
        );

    }

    onPointerUp(event) {

        if (!this.session.isWriting) {

            return;

        }

        event.preventDefault();

        if (

            this.canvas.hasPointerCapture(

                event.pointerId

            )

        ) {

            this.canvas.releasePointerCapture(

                event.pointerId

            );

        }

        this.session.endStroke();

        this.pen.setStrokes(

            this.session.getRenderableStrokes()

        );

    }

    getCanvasPoint(event) {

        const rect =

            this.canvas.getBoundingClientRect();

        return {

            x: event.clientX - rect.left,

            y: event.clientY - rect.top

        };

    }

    async handleSessionComplete(session) {

        try {

            const canvas = this.captureWriting(session);

            if (!canvas) {

                return;

            }

            const result = await this.client.send(canvas);

            this.diary.setText(
                result.reply,
                this.canvas.width / this.dpr
            );

            console.log("Text set:", this.diary.text);

            this.replyAnimator.play();
            // Clear the handwritten strokes
            this.session.clear();
            this.pen.setStrokes([]);

                    }

        catch (error) {

            console.error(

                "Diary request failed:",

                error

            );

        }

    }

    captureWriting(session) {

        const strokes = session.strokes;

        if (!strokes.length) {

            return null;

        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const stroke of strokes) {

            const bounds = stroke.bounds;

            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);

            maxX = Math.max(
                maxX,
                bounds.x + bounds.width
            );

            maxY = Math.max(
                maxY,
                bounds.y + bounds.height
            );

        }

        const padding = 30;

        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const width = Math.ceil(maxX - minX);
        const height = Math.ceil(maxY - minY);

        if (width <= 0 || height <= 0) {

            return null;

        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // White background for Gemini Vision
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Move the handwriting into the cropped canvas
        ctx.translate(-minX, -minY);

        // Reuse the exact renderer used on screen
        this.pen.drawTo(

            ctx,

            strokes

        );

        return canvas;

    }

}