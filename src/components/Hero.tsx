import { useEffect, useRef } from "react";

import gsap from "gsap";
import ScrollTrigger from 'gsap/ScrollTrigger'

const FRAME_COUNT = 100

function getCurrentFramePath(idx:number) {
  return `/images/frames/${(idx + 1).toString().padStart(3, '0')}.webp`
}

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const contentRef = useRef<HTMLDivElement | null>(null)
  const videoFrames = useRef(0)

  function setCanvasSize() {
    if(!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')!

    // with fallback value
    const pixelRatio = window.devicePixelRatio || 1

    canvas.width = window.innerWidth * pixelRatio
    canvas.height = window.innerHeight * pixelRatio
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'

    // reset any transform values
    context.setTransform(1,0,0,1,0,0)
    context.scale(pixelRatio, pixelRatio)
  }

  function render() {
    if(!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')!

    const canvasWidth = window.innerWidth
    const canvasHeight = window.innerHeight

    context.clearRect(0,0,canvasWidth, canvasHeight)

    const img = imagesRef.current[videoFrames.current] as HTMLImageElement

    const imageAspect = img.naturalWidth / img.naturalHeight
    const canvasAspect = canvasWidth / canvasHeight
    let drawWidth, drawHeight, drawX, drawY
    if(imageAspect > canvasAspect) {
      drawHeight = canvasHeight
      drawWidth = drawHeight * imageAspect
      drawX = (canvasWidth - drawWidth) /2
      drawY = 0
    } else {
      drawWidth = canvasWidth
      drawHeight = drawWidth / imageAspect
      drawX = 0
      drawY = (canvasHeight - drawHeight) /2
    }

    context.beginPath()
    context.drawImage(img, drawX, drawY, drawWidth, drawHeight)
  }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // After page reload, we start our view from top of the page
    const body = document.querySelector('body')
    body?.scrollIntoView({behavior: 'instant'})

    setCanvasSize()

    const images: HTMLImageElement[] = []

    Promise.all(
      Array.from({length: FRAME_COUNT}, (_, i) => {
        return new Promise(resolve => {
          const img = new Image()
          img.onload = resolve
          img.onerror = resolve

          img.src = getCurrentFramePath(i)
          images.push(img)
        })
      })
    ).then(() => {
      // after loading all images, set them to imagesRef array
      imagesRef.current = images
      render()
      setupScrollTrigger()
      // HERE YOU CAN REMOVE YOUR LOADING STATE
    })

    const setupScrollTrigger = () => {
      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        // try values from 2-8
        end: `+=${window.innerHeight * 5}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress
          // animation ends in 90% of scroll area
          const animationProgress = Math.min(progress / 0.9, 1)
          const targetFrame = Math.round(animationProgress * (FRAME_COUNT - 1))
          videoFrames.current = targetFrame
          render()

          if (contentRef.current) {
            if (progress <= 0.8) {
              const zProgress = progress / 0.1
              const translateZ = zProgress * -500
              let opacity = 1
              if (progress >= 0.2) {
                const fadeProgress = Math.min((progress - 0.5) / (0.25 - 0.2), 1)
                opacity = 1 - fadeProgress
              }
              gsap.set(contentRef.current, {
                transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
                opacity,
              })
            } else {
              gsap.set(contentRef.current, { opacity: 0 })
            }
          }
        }
      })
    }

    function handleResize() {
      setCanvasSize()
      render()
      ScrollTrigger.refresh()
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])



  return (
    <>
      {/* header */}
      <header className="absolute text-white top-0 left-0 z-30 flex w-full items-center px-[3vw] py-[2vw] text-[1.4vw] font-medium tracking-wide">
        <div className="text-[1.6vw] ">DevByShat</div>
        <nav className="z-100 flex flex-1 items-center justify-end gap-10">
          <ul className="flex gap-9">
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </nav>
      </header>

      <section className="hero relative">
        {/* gradient bg */}
        <div className="absolute top-0 left-0 z-10 h-full w-full bg-gradient-to-t from-black/50 to-black/20"></div>
        {/* canvas element */}
        <canvas ref={canvasRef} className="-z-1 h-full w-full object-cover grayscale-0" />
        <div className="fixed top-0 z-20 h-full w-full py-2 perspective-distant transform-3d">
          <div
            ref={contentRef}
            className="absolute top-1/2 left-1/2 w-full origin-center -translate-x-1/2 -translate-y-1/2 text-center text-white will-change-transform"
          >
            <h1 className="text-[10vw] leading-[105%] font-bold tracking-tight text-white uppercase">
              Watch Beauty <br /> Unfold
            </h1>
          </div>
        </div>
      </section>

      <section className="flex h-svh w-full items-center justify-center text-white bg-zinc-900 text-[4vw]">@devbyshat</section>
    </>
  )
};
export default Hero