import Stroke from "./Stroke.js";

export default class SessionManager {

    constructor({

        idleTimeout = 2000,

        onSessionComplete = () => {}

    } = {}) {

        this.idleTimeout = idleTimeout;

        this.onSessionComplete = onSessionComplete;

        this.currentStroke = null;

        this.strokes = [];

        this.timer = null;

        this.sessionStartedAt = null;

    }

    /**
     * Begin a new stroke.
     */
    beginStroke(x, y, pressure = 0.5) {

        this.clearTimer();

        if (!this.sessionStartedAt) {

            this.sessionStartedAt = performance.now();

        }

        this.currentStroke = new Stroke();

        this.currentStroke.addPoint(

            x,

            y,

            pressure

        );

        return this.currentStroke;

    }

    /**
     * Continue current stroke.
     */
    updateStroke(x, y, pressure = 0.5) {

        if (!this.currentStroke) {

            return;

        }

        this.currentStroke.addPoint(

            x,

            y,

            pressure

        );

    }

    /**
     * Finish current stroke.
     */
    endStroke() {

        if (!this.currentStroke) {

            return;

        }

        this.currentStroke.finish();

        if (!this.currentStroke.isEmpty) {

            this.strokes.push(

                this.currentStroke

            );

        }

        this.currentStroke = null;

        this.startIdleTimer();

    }

    /**
     * Remove everything.
     */
    clear() {

        this.clearTimer();

        this.currentStroke = null;

        this.strokes = [];

        this.sessionStartedAt = null;

    }

    /**
     * Current completed strokes.
     */
    getStrokes() {

        return this.strokes.map(

            stroke => stroke.clone()

        );

    }

    /**
     * Is user currently writing?
     */
    get isWriting() {

        return this.currentStroke !== null;

    }

    /**
     * Number of finished strokes.
     */
    get strokeCount() {

        return this.strokes.length;

    }

    /**
     * Session duration.
     */
    get duration() {

        if (!this.sessionStartedAt) {

            return 0;

        }

        return performance.now() -

            this.sessionStartedAt;

    }

    /**
     * Start idle countdown.
     */
    startIdleTimer() {

        this.clearTimer();

        this.timer = setTimeout(

            () => {

                this.finishSession();

            },

            this.idleTimeout

        );

    }

    /**
     * Finish handwriting session.
     */
    finishSession() {

        if (this.strokes.length === 0) {

            return;

        }

        const session = {

            startedAt: this.sessionStartedAt,

            endedAt: performance.now(),

            duration: this.duration,

            strokes: this.getStrokes()

        };

        this.onSessionComplete(

            session

        );

        this.clear();

    }

    /**
     * Cancel timer.
     */
    clearTimer() {

        if (this.timer) {

            clearTimeout(

                this.timer

            );

            this.timer = null;

        }

    }

    getRenderableStrokes() {

        const strokes = [...this.strokes];

        if (this.currentStroke) {

            strokes.push(this.currentStroke.clone());

        }

        return strokes;

    }
}