window.onload = _ => {
    console.log('page loaded');

    let elem = document.querySelector("section");
    let rect = elem.getBoundingClientRect();
    console.log('rect', rect.height);
    // Creating a frequency bar graph
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API


    const buttons = document.querySelectorAll('button');
    buttons.forEach(b => {
        b.addEventListener('click', function (e) {
            const theme = this.getAttribute('data-value');
            console.log('theme', theme);
            const WIDTH = Number(rect.width);
            const HEIGHT = Number(rect.height);
            // Create the audio context
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = context.createAnalyser();
            // Make a place to store the audio
            let sourceBuffer = context.createBufferSource();



            // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas
            const canvas = document.querySelector(`#canvas-${theme}`);
            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            const canvasCtx = canvas.getContext("2d");
            // canvasCtx.fillStyle = "rgb(0, 0, 200, 0.5)";
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            // Prepare to access a URL
            fetch(`./assets/content/${theme}/theme.mp3`, { mode: "no-cors" })
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    sourceBuffer.buffer = audioBuffer;

                    sourceBuffer.connect(analyser);


                    // connect it to the output
                    sourceBuffer.connect(context.destination);
                    // play it
                    sourceBuffer.start(0);

                    analyser.fftSize = 256;

                    const bufferLength = analyser.frequencyBinCount;
                    console.log('bufferLength', bufferLength);
                    const dataArray = new Uint8Array(bufferLength);

                    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);


                    function draw() {
                        const drawVisual = requestAnimationFrame(draw);

                        analyser.getByteFrequencyData(dataArray);

                        canvasCtx.fillStyle = "rgb(255 255 255)";
                        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                        const barWidth = (WIDTH / bufferLength);
                        let barHeight;
                        let x = 0;

                        for (let i = 0; i < bufferLength; i++) {
                            barHeight = dataArray[i] * 8;

                            canvasCtx.fillStyle = `rgb(${barHeight + 100} 0 55)`;
                            canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

                            x += barWidth + 1;
                        }
                    }
                    draw();
                });
        });

    });
}