export default class PenRenderer {

    constructor() {

        this.strokes = [];

        this.color = "#1d1a17";

        this.minWidth = 2.5;
        this.maxWidth = 4.5;

    }

    setStrokes(strokes) {

        this.strokes = strokes;

    }

    clear() {

        this.strokes = [];

    }

    draw(ctx) {

        this.drawTo(ctx, this.strokes);

    }

    drawTo(ctx, strokes) {

        if (!strokes || strokes.length === 0) {

            return;

        }

        ctx.save();

        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (const stroke of strokes) {

            this.drawStroke(ctx, stroke);

        }

        ctx.restore();

    }

    drawStroke(ctx, stroke) {

        const points = stroke.points;

        if (!points || points.length === 0) {

            return;

        }

        if (points.length === 1) {

            const p = points[0];

            const radius = this.computeWidth(p.pressure) / 2;

            ctx.beginPath();

            ctx.arc(

                p.x,

                p.y,

                radius,

                0,

                Math.PI * 2

            );

            ctx.fill();

            return;

        }

        for (let i = 0; i < points.length - 1; i++) {

            const p0 = points[i];
            const p1 = points[i + 1];

            const midX = (p0.x + p1.x) * 0.5;
            const midY = (p0.y + p1.y) * 0.5;

            ctx.lineWidth = this.computeWidth(p1.pressure);

            ctx.beginPath();

            ctx.moveTo(

                p0.x,

                p0.y

            );

            ctx.quadraticCurveTo(

                p0.x,

                p0.y,

                midX,

                midY

            );

            ctx.stroke();

        }

        const last = points[points.length - 1];

        ctx.beginPath();

        ctx.arc(

            last.x,

            last.y,

            this.computeWidth(last.pressure) / 2,

            0,

            Math.PI * 2

        );

        ctx.fill();

    }

    computeWidth(pressure) {

        const p = Math.max(

            0,

            Math.min(

                1,

                pressure || 0.5

            )

        );

        return (

            this.minWidth +

            (this.maxWidth - this.minWidth) * p

        );

    }

}