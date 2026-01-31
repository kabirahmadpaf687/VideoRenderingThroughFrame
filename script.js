gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("hero");
const ctx = canvas.getContext("2d");

const frameCount = 313;
const images = [];
const seq = { frame: 0 };

let cw, ch;

// ---------- CANVAS SETUP ----------
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  cw = window.innerWidth;
  ch = window.innerHeight;

  canvas.width = cw * dpr;
  canvas.height = ch * dpr;

  canvas.style.width = cw + "px";
  canvas.style.height = ch + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  render();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ---------- IMAGE LOADING ----------
for (let i = 1; i <= frameCount; i++) {
  const img = new Image();
  img.src = `frames/frame_${String(i).padStart(4, "0")}.png`;
  images.push(img);
}

// ---------- DRAW LIKE object-fit: cover ----------
function drawCover(img) {
  const imgRatio = img.width / img.height;
  const canvasRatio = cw / ch;

  let drawWidth, drawHeight, x, y;

  if (imgRatio > canvasRatio) {
    drawHeight = ch;
    drawWidth = drawHeight * imgRatio;
    x = (cw - drawWidth) / 2;
    y = 0;
  } else {
    drawWidth = cw;
    drawHeight = drawWidth / imgRatio;
    x = 0;
    y = (ch - drawHeight) / 2;
  }

  ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

// ---------- RENDER ----------
function render() {
  const img = images[seq.frame];
  if (!img || !img.complete) return;

  ctx.clearRect(0, 0, cw, ch);
  drawCover(img);
}

// Draw first frame immediately
images[0].onload = render;

// ---------- SCROLL CONTROL ----------
gsap.to(seq, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: ".spacer",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.6
  },
  onUpdate: render
});

// ---------- HINT AND OVERLAY FADE ----------
const scrollHint = document.getElementById("scrollHint");
const overlay = document.querySelector(".overlay");

let hasScrolled = false;

window.addEventListener("scroll", () => {
  if (!hasScrolled && window.scrollY > 10) {
    hasScrolled = true;

    // Hide the arrow hint
    gsap.to(scrollHint, {
      opacity: 0,
      y: -10,
      duration: 0.6,
      ease: "power2.out",
    });

    // Show the overlay (logo + text) and scale it up
    gsap.fromTo(
      overlay,
      { 
        opacity: 0,
        scale: 0.8
      },
      { 
        opacity: 1, 
        scale: 1.5,
        ease: "none",
        scrollTrigger: {
          trigger: ".spacer",
          start: "top 50%",
          end: "bottom bottom",
          scrub: 0.6
        }
      }
    );
  }
});

// ---------- WHITE OVERLAY FADE ----------
gsap.fromTo(".white-overlay", {
  opacity: -2,
}, {
  opacity: 0.9,
  ease: "none",
  scrollTrigger: {
    trigger: ".spacer",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.6
  }
});

// ---------- FORMS REVEAL ----------
gsap.to(".form-container", {
  opacity: 1,
  duration: 4, // Slower duration
  ease: "power2.inOut",
  scrollTrigger: {
    trigger: ".form-container",
    start: "top 95%", // Start later
    end: "top 80%",   // End later
    scrub: 1.5        // More scrub for slower feel
  }
});

// ---------- FORMS SUBMISSION (PHP) ----------
const newsletterForm = document.getElementById("newsletter-form");
const contactForm = document.getElementById("contact-form");

function handleFormSubmit(form, type) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector("button");
    const originalBtnText = submitBtn.innerText;
    
    // Feedback
    submitBtn.innerText = "SENDING...";
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.type = type;

    try {
      const response = await fetch("send-email.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert("Thank you! Your message has been sent.");
        form.reset();
      } else {
        alert("Oops! " + (result.message || "Something went wrong.") + "\n\nDebug Info:\n" + (result.debug || "No debug info available."));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to server.");
    } finally {
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}

if (newsletterForm) handleFormSubmit(newsletterForm, "newsletter");
if (contactForm) handleFormSubmit(contactForm, "contact");
