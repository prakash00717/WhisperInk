export default class BackgroundRenderer {

    constructor(canvas) {

        this.canvas = canvas;
        this.margin = 40;

        this.paperTexture = null;

        this.generateTexture();

    }

    resize() {

        this.generateTexture();

    }

    generateTexture() {

        const width =
            this.canvas.width / window.devicePixelRatio;

        const height =
            this.canvas.height / window.devicePixelRatio;

        const texture =
            document.createElement("canvas");

        texture.width =
            width - this.margin * 2;

        texture.height =
            height - this.margin * 2;

        const ctx =
            texture.getContext("2d");

        // Base paper

        ctx.fillStyle = "#f4ecd8";

        ctx.fillRect(

            0,

            0,

            texture.width,

            texture.height

        );

        // Old paper gradient

        const gradient =
            ctx.createRadialGradient(

                texture.width / 2,

                texture.height / 2,

                80,

                texture.width / 2,

                texture.height / 2,

                texture.width

            );

        gradient.addColorStop(

            0,

            "rgba(255,255,255,0)"

        );

        gradient.addColorStop(

            1,

            "rgba(120,90,40,0.12)"

        );

        ctx.fillStyle = gradient;

        ctx.fillRect(

            0,

            0,

            texture.width,

            texture.height

        );

        // Tiny fibers

        ctx.fillStyle =
            "rgba(80,60,30,0.04)";

        for (let i = 0; i < 1800; i++) {

            const x =
                Math.random() * texture.width;

            const y =
                Math.random() * texture.height;

            ctx.fillRect(

                x,

                y,

                1,

                1

            );

        }

        // Small scratches

        ctx.strokeStyle =
            "rgba(90,70,40,0.03)";

        ctx.lineWidth = 1;

        for (let i = 0; i < 120; i++) {

            const x =
                Math.random() * texture.width;

            const y =
                Math.random() * texture.height;

            const len =
                Math.random() * 12;

            ctx.beginPath();

            ctx.moveTo(

                x,

                y

            );

            ctx.lineTo(

                x + len,

                y + len * 0.2

            );

            ctx.stroke();

        }

        this.paperTexture = texture;

    }

    draw(ctx) {

        const width =
            ctx.canvas.width / window.devicePixelRatio;

        const height =
            ctx.canvas.height / window.devicePixelRatio;

        // Wooden desk

        ctx.fillStyle = "#8d7452";

        ctx.fillRect(

            0,

            0,

            width,

            height

        );

        // Page shadow

        ctx.save();

        ctx.shadowColor =
            "rgba(0,0,0,0.35)";

        ctx.shadowBlur = 30;

        ctx.shadowOffsetX = 8;

        ctx.shadowOffsetY = 10;

        ctx.fillStyle = "#f4ecd8";

        ctx.fillRect(

            this.margin,

            this.margin,

            width - this.margin * 2,

            height - this.margin * 2

        );

        ctx.restore();

        // Paper texture

        ctx.drawImage(

            this.paperTexture,

            this.margin,

            this.margin

        );

    }

}