export default class Stroke {

    constructor(id = crypto.randomUUID()) {

        this.id = id;

        this.points = [];

        this.startedAt = performance.now();

        this.finishedAt = null;

        this.minX = Infinity;
        this.minY = Infinity;

        this.maxX = -Infinity;
        this.maxY = -Infinity;

    }

    /**
     * Add a point to the stroke.
     */
    addPoint(x, y, pressure = 0.5) {

        const point = {

            x,

            y,

            pressure: this.#clampPressure(pressure),

            time: performance.now()

        };

        this.points.push(point);

        if (x < this.minX) this.minX = x;
        if (y < this.minY) this.minY = y;

        if (x > this.maxX) this.maxX = x;
        if (y > this.maxY) this.maxY = y;

    }

    /**
     * Finish the stroke.
     */
    finish() {

        this.finishedAt = performance.now();

    }

    /**
     * Number of points.
     */
    get length() {

        return this.points.length;

    }

    /**
     * True if stroke contains no points.
     */
    get isEmpty() {

        return this.points.length === 0;

    }

    /**
     * Bounding box.
     */
    get bounds() {

        if (this.isEmpty) {

            return {

                x: 0,
                y: 0,
                width: 0,
                height: 0

            };

        }

        return {

            x: this.minX,

            y: this.minY,

            width: this.maxX - this.minX,

            height: this.maxY - this.minY

        };

    }

    /**
     * Total duration.
     */
    get duration() {

        const end = this.finishedAt ?? performance.now();

        return end - this.startedAt;

    }

    /**
     * Total drawn length.
     */
    get pathLength() {

        let length = 0;

        for (let i = 1; i < this.points.length; i++) {

            const p1 = this.points[i - 1];

            const p2 = this.points[i];

            length += Math.hypot(

                p2.x - p1.x,

                p2.y - p1.y

            );

        }

        return length;

    }

    /**
     * Average pen pressure.
     */
    get averagePressure() {

        if (this.isEmpty) return 0;

        let total = 0;

        for (const point of this.points) {

            total += point.pressure;

        }

        return total / this.points.length;

    }

    /**
     * Deep copy.
     */
    clone() {

        const stroke = new Stroke(this.id);

        stroke.startedAt = this.startedAt;

        stroke.finishedAt = this.finishedAt;

        stroke.minX = this.minX;
        stroke.minY = this.minY;

        stroke.maxX = this.maxX;
        stroke.maxY = this.maxY;

        stroke.points = this.points.map(point => ({

            x: point.x,

            y: point.y,

            pressure: point.pressure,

            time: point.time

        }));

        return stroke;

    }

    /**
     * JSON serialization.
     */
    toJSON() {

        return {

            id: this.id,

            startedAt: this.startedAt,

            finishedAt: this.finishedAt,

            points: this.points

        };

    }

    /**
     * Restore from JSON.
     */
    static fromJSON(data) {

        const stroke = new Stroke(data.id);

        stroke.startedAt = data.startedAt;

        stroke.finishedAt = data.finishedAt;

        stroke.points = data.points;

        stroke.minX = Infinity;
        stroke.minY = Infinity;

        stroke.maxX = -Infinity;
        stroke.maxY = -Infinity;

        for (const point of stroke.points) {

            if (point.x < stroke.minX) stroke.minX = point.x;
            if (point.y < stroke.minY) stroke.minY = point.y;

            if (point.x > stroke.maxX) stroke.maxX = point.x;
            if (point.y > stroke.maxY) stroke.maxY = point.y;

        }

        return stroke;

    }

    #clampPressure(value) {

        if (!Number.isFinite(value)) {

            return 0.5;

        }

        return Math.min(

            1,

            Math.max(

                0.05,

                value

            )

        );

    }

}