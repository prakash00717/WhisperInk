export default class ReplyAnimator {

    constructor(diaryRenderer) {

        this.diary = diaryRenderer;

        this.duration = 1200; // milliseconds

        this.animationFrame = null;

    }

    play() {

        console.log("ReplyAnimator.play()");
        this.stop();

        this.diary.opacity = 0;

        const start = performance.now();

        const animate = (now) => {

            const elapsed = now - start;

            let t = elapsed / this.duration;

            if (t > 1) {
                t = 1;
            }

            // Ease-out cubic
            t = 1 - Math.pow(1 - t, 3);

            this.diary.opacity = t;

            if (t < 1) {

                this.animationFrame =
                    requestAnimationFrame(animate);

            } else {

                this.animationFrame = null;

            }

        };

        this.animationFrame =
            requestAnimationFrame(animate);

    }

    stop() {

        if (this.animationFrame !== null) {

            cancelAnimationFrame(this.animationFrame);

            this.animationFrame = null;

        }

    }

}