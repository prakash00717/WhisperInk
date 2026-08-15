export default class CharacterRenderer {

    constructor(ctx) {

        this.ctx = ctx;

        this.ctx.font = "42px Caveat";

        this.ctx.textBaseline = "alphabetic";

    }

    build(character) {

        return {

            character,

            width: this.ctx.measureText(character).width

        };

    }

    async animate(glyph, x, y) {

        return new Promise(resolve => {

            let alpha = 0;

            const animate = () => {

                alpha += 0.08;

                if (alpha > 1)
                    alpha = 1;

                this.ctx.save();

                this.ctx.globalAlpha = alpha;

                this.ctx.fillText(

                    glyph.character,

                    x,

                    y

                );

                this.ctx.restore();

                if (alpha < 1) {

                    requestAnimationFrame(animate);

                } else {

                    resolve();

                }

            };

            animate();

        });

    }

}