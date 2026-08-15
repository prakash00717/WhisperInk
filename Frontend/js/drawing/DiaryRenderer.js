export default class DiaryRenderer {

    constructor() {

        this.text = "";

        this.characters = [];

        this.opacity = 0;

        this.marginLeft = 110;
        this.marginTop = 120;
        this.marginRight = 110;

        this.lineHeight = 42;

        this.fontSize = 30;

        this.fontFamily =
            '"Cormorant Garamond", serif';

        this.font =
            `${this.fontSize}px ${this.fontFamily}`;

        this.color = "#1d1a17";

        this.paperWidth = 0;

    }

    clear() {

        this.text = "";

        this.characters = [];

        this.opacity = 0;

    }

    setText(text, paperWidth = 900) {

        this.text = text || "";

        this.paperWidth = paperWidth;

        this.layout();

    }

    layout() {

        this.characters = [];

        if (!this.text.length) {

            return;

        }

        const canvas =
            document.createElement("canvas");

        const ctx =
            canvas.getContext("2d");

        ctx.font = this.font;

        const maxWidth =
            this.paperWidth -
            this.marginLeft -
            this.marginRight;

        let x =
            this.marginLeft;

        let y =
            this.marginTop;

        const paragraphs =
            this.text.split("\n");

        for (let p = 0;
             p < paragraphs.length;
             p++) {

            const words =
                paragraphs[p].split(" ");

            for (const word of words) {

                const wordWidth =
                    ctx.measureText(word).width;

                if (

                    x !== this.marginLeft &&

                    x + wordWidth > this.marginLeft + maxWidth

                ) {

                    x = this.marginLeft;

                    y += this.lineHeight;

                }

                for (const ch of word) {

                    const width =
                        ctx.measureText(ch).width;

                    this.characters.push({

                        char: ch,

                        x,

                        y,

                        dx: (Math.random() - 0.5) * 1.5,

                        dy: (Math.random() - 0.5) * 2,

                        rotation: (Math.random() - 0.5) * 0.05,

                        alpha: 0.90 + Math.random() * 0.10

                    });

                    const spacing =
                        (Math.random() - 0.5) * 1.2;

                    x += width + (Math.random() - 0.5) * 0.8;

                }

                const space =
                    ctx.measureText(" ").width;

                this.characters.push({

                    char: " ",

                    x,

                    y,

                    dx: 0,

                    dy: 0,

                    rotation: 0,

                    alpha: 1

                });

                x += space + (Math.random() - 0.5) * 1.5;

            }

            x = this.marginLeft;

            y += this.lineHeight;

        }

    }

    draw(ctx, paperWidth) {

        if (!ctx) {

            return;

        }

        if (

            paperWidth !== this.paperWidth &&

            paperWidth > 0

        ) {

            this.paperWidth = paperWidth;

            this.layout();

        }

        ctx.save();

        ctx.globalAlpha = this.opacity;

        ctx.font = this.font;

        ctx.fillStyle = this.color;

        ctx.textBaseline = "alphabetic";

        for (const character of this.characters) {

            ctx.save();

            ctx.globalAlpha =
                this.opacity * character.alpha;

            ctx.translate(

                character.x + character.dx,

                character.y + character.dy

            );

            ctx.rotate(character.rotation);

            ctx.fillText(

                character.char,

                0,

                0

            );

            ctx.restore();

        }

        ctx.restore();

    }


}