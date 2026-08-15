export default class LayoutEngine {

    constructor(canvas) {

        this.canvas = canvas;

        this.marginLeft = 120;
        this.marginTop = 140;

        this.lineHeight = 65;

        this.charSpacing = 6;

        this.cursorX = this.marginLeft;
        this.cursorY = this.marginTop;

    }

    reset() {

        this.cursorX = this.marginLeft;
        this.cursorY = this.marginTop;

    }

    setStart(x, y) {

        this.cursorX = x;
        this.cursorY = y;

    }

    next(width) {

        if (
            this.canvas &&
            this.cursorX + width >
            this.canvas.width - this.marginLeft
        ) {

            this.newLine();

        }

        const pos = {

            x: this.cursorX,
            y: this.cursorY

        };

        this.cursorX += width + this.charSpacing;

        return pos;

    }

    newLine() {

        this.cursorX = this.marginLeft;

        this.cursorY += this.lineHeight;

    }

}