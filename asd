// // Interactive horizontal timeline with cursor-following scroll and active image background display
// // Timeline items become active based on cursor position, showing large background image with smooth transitions
// // Timeline scrolls horizontally and background changes as you scroll through the images
// // Auto-scrolls infinitely in a loop

// import {
//     useState,
//     useRef,
//     useEffect,
//     useMemo,
//     startTransition,
//     type CSSProperties,
// } from "react"
// import { addPropertyControls, ControlType, RenderTarget } from "framer"
// import { motion, AnimatePresence } from "framer-motion"
// import type React from "react"

// type FramerImage = any

// interface TimelineImage {
//     type?: "image" | "video"
//     image?: FramerImage // ResponsiveImage può avere shape diversa
//     video?: string // file upload
//     videoUrl?: string // url incollabile
//     imageFit?: "fill" | "fit"
// }

// interface InteractiveHeroGalleryProps {
//     images: TimelineImage[]
//     itemSize: number
//     itemSpacing: number
//     transitionDuration: number
//     overlayOpacity: number
//     autoScrollSpeed: number
//     itemBorderRadius: number
//     timelineBottomPadding: number
//     timelineImageOpacity: number
//     timelineImageSaturation: number
//     timelinePosition: "bottom" | "top"
//     timelineAutoHide: boolean
//     timelineHideDelay: number
//     style?: CSSProperties
// }

// function getImageSrc(img: any): string {
//     if (!img) return ""

//     // string diretto
//     if (typeof img === "string") return img

//     // campi comuni
//     if (typeof img.src === "string" && img.src) return img.src
//     if (typeof img.url === "string" && img.url) return img.url
//     if (typeof img.originalSrc === "string" && img.originalSrc)
//         return img.originalSrc

//     // ✅ ResponsiveImage spesso usa srcSet
//     if (typeof img.srcSet === "string" && img.srcSet.trim()) {
//         // es: "https://... 1x, https://... 2x"
//         const first = img.srcSet.split(",")[0]?.trim()
//         const url = first?.split(" ")[0]?.trim()
//         if (url) return url
//     }

//     // fallback extra
//     if (typeof img.preview === "string" && img.preview) return img.preview

//     return ""
// }

// function getImageAlt(img: any): string {
//     if (!img) return ""
//     if (typeof img === "object" && typeof img.alt === "string") return img.alt
//     return ""
// }

// const DEFAULT_IMAGES = [
//     {
//         type: "image",
//         image: {
//             src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
//             alt: "Image 1",
//         },
//         imageFit: "fill",
//     },
//     {
//         type: "image",
//         image: {
//             src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
//             alt: "Image 2",
//         },
//         imageFit: "fill",
//     },
//     {
//         type: "image",
//         image: {
//             src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
//             alt: "Image 3",
//         },
//         imageFit: "fill",
//     },

//     // ✅ aggiungi queste 3
//     {
//         type: "image",
//         image: {
//             src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
//             alt: "Image 4",
//         },
//         imageFit: "fill",
//     },
//     {
//         type: "image",
//         image: {
//             src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
//             alt: "Image 5",
//         },
//         imageFit: "fill",
//     },
//     {
//         type: "image",
//         image: {
//             src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
//             alt: "Image 6",
//         },
//         imageFit: "fill",
//     },
// ]

// /**
//  * Interactive Timeline
//  *
//  * @framerIntrinsicWidth 1200
//  * @framerIntrinsicHeight 600
//  *
//  * @framerSupportedLayoutWidth fixed
//  * @framerSupportedLayoutHeight fixed
//  */

// export default function InteractiveHeroGallery(
//     props: InteractiveHeroGalleryProps
// ) {
//     const {
//         images = DEFAULT_IMAGES,
//         itemSize = 70,
//         itemSpacing = 0,
//         transitionDuration = 0,
//         overlayOpacity = 0,
//         autoScrollSpeed = 1,
//         itemBorderRadius = 0,
//         timelineBottomPadding = 60,
//         timelineImageOpacity = 100,
//         timelineImageSaturation = 100,
//         timelinePosition = "bottom",
//         timelineAutoHide = true,
//         timelineHideDelay = 3,
//     } = props

//     const rt = RenderTarget.current()
//     const isStatic =
//         rt === RenderTarget.canvas ||
//         rt === RenderTarget.thumbnail ||
//         rt === RenderTarget.export

//     const duration = isStatic ? 0 : transitionDuration

//     const safeImages = useMemo(() => {
//         const list = (images ?? []).filter((it) => {
//             const hasPoster = !!getImageSrc(it?.image)
//             const hasVideo =
//                 (it?.type || "image") === "video" &&
//                 !!(it?.videoUrl || it?.video)
//             return hasPoster || hasVideo
//         })
//         return list.length ? list : DEFAULT_IMAGES
//     }, [images])
//     const containerRef = useRef<HTMLDivElement>(null)
//     const timelineRef = useRef<HTMLDivElement>(null)
//     const [activeIndex, setActiveIndex] = useState(0)
//     const animationFrameRef = useRef<number | null>(null)
//     const [isDragging, setIsDragging] = useState(false)
//     const [isPaused, setIsPaused] = useState(false)
//     const dragStartRef = useRef({ x: 0, scrollLeft: 0 })
//     const hasDraggedRef = useRef(false)
//     const backgroundDragStartRef = useRef({ x: 0, scrollLeft: 0 })
//     const hasBackgroundDraggedRef = useRef(false)
//     const [isTimelineVisible, setIsTimelineVisible] = useState(true)
//     const hideTimeoutRef = useRef<number | null>(null)
//     const [videoThumbnails, setVideoThumbnails] = useState<
//         Record<number, string>
//     >({})

//     // Duplicate images for infinite loop
//     const SETS = 5

//     const duplicatedImages = useMemo(() => {
//         return Array.from({ length: SETS }, () => safeImages).flat()
//     }, [safeImages])

//     const totalWidth = useMemo(() => {
//         return safeImages.length * (itemSize + itemSpacing) - itemSpacing
//     }, [safeImages.length, itemSize, itemSpacing])

//     const singleSetWidth = useMemo(() => {
//         return totalWidth + itemSpacing
//     }, [totalWidth, itemSpacing])

//     const midSet = Math.floor(SETS / 2)

//     // Auto-scroll effect
//     useEffect(() => {
//         if (isStatic) return
//         const timeline = timelineRef.current
//         if (!timeline) return

//         let lastTime = performance.now()

//         const animate = (currentTime: number) => {
//             const deltaTime = currentTime - lastTime
//             lastTime = currentTime

//             if (!isDragging && !isPaused) {
//                 timeline.scrollLeft += (autoScrollSpeed * deltaTime) / 16

//                 const midPoint = singleSetWidth * midSet

//                 while (timeline.scrollLeft >= midPoint + singleSetWidth) {
//                     timeline.scrollLeft -= singleSetWidth
//                 }
//                 while (timeline.scrollLeft <= midPoint - singleSetWidth) {
//                     timeline.scrollLeft += singleSetWidth
//                 }
//             }

//             animationFrameRef.current = requestAnimationFrame(animate)
//         }

//         animationFrameRef.current = requestAnimationFrame(animate)

//         return () => {
//             if (animationFrameRef.current)
//                 cancelAnimationFrame(animationFrameRef.current)
//         }
//     }, [
//         isStatic,
//         autoScrollSpeed,
//         isDragging,
//         isPaused,
//         singleSetWidth,
//         midSet,
//     ])

//     useEffect(() => {
//         if (isStatic) return
//         const handleScroll = () => {
//             if (safeImages.length === 0) return
//             if (!timelineRef.current || !containerRef.current) return

//             const timeline = timelineRef.current
//             const container = containerRef.current
//             const scrollLeft = timeline.scrollLeft
//             const containerWidth = container.getBoundingClientRect().width

//             // Handle infinite loop reset during manual scroll/drag
//             const midPoint = singleSetWidth * midSet

//             if (scrollLeft >= midPoint + singleSetWidth) {
//                 timeline.scrollLeft -= singleSetWidth
//                 return
//             } else if (scrollLeft <= midPoint - singleSetWidth) {
//                 timeline.scrollLeft += singleSetWidth
//                 return
//             }

//             startTransition(() => {
//                 const itemWidth = itemSize + itemSpacing
//                 const indicatorPosition = containerWidth / 2
//                 const targetX = scrollLeft + indicatorPosition - itemSize / 2

//                 const closestIndex = Math.round(targetX / itemWidth)
//                 const len = safeImages.length
//                 const originalIndex = ((closestIndex % len) + len) % len

//                 setActiveIndex(originalIndex)
//             })
//         }

//         const timeline = timelineRef.current
//         if (timeline) {
//             timeline.addEventListener("scroll", handleScroll)
//             // Set initial scroll position to middle set
//             const singleSetWidth = totalWidth + itemSpacing
//             timeline.scrollLeft = singleSetWidth * midSet
//             // Trigger initial scroll handler to set correct activeIndex
//             handleScroll()
//             return () => timeline.removeEventListener("scroll", handleScroll)
//         }
//     }, [
//         isStatic,
//         safeImages.length,
//         itemSize,
//         itemSpacing,
//         singleSetWidth,
//         midSet,
//     ])

//     const activeImage = safeImages[activeIndex]
//     const mainSrc = getImageSrc(activeImage?.image)

//     const isVideo = (activeImage?.type || "image") === "video"
//     const videoSrc = activeImage?.videoUrl || activeImage?.video || ""

//     const handleBackgroundMouseDown = () => {
//         startTransition(() => {
//             setIsPaused(true)
//         })
//     }

//     const handleBackgroundMouseUp = () => {
//         startTransition(() => {
//             setIsPaused(false)
//         })
//     }

//     const handleBackgroundTouchStart = () => {
//         startTransition(() => {
//             setIsPaused(true)
//         })
//     }

//     const handleBackgroundTouchEnd = () => {
//         startTransition(() => {
//             setIsPaused(false)
//         })
//     }

//     const handleBackgroundDragMouseDown = (e: React.MouseEvent) => {
//         if (!timelineRef.current) return
//         hasBackgroundDraggedRef.current = false
//         backgroundDragStartRef.current = {
//             x: e.pageX,
//             scrollLeft: timelineRef.current.scrollLeft,
//         }
//     }

//     const handleBackgroundDragMouseMove = (e: React.MouseEvent) => {
//         if (!backgroundDragStartRef.current.x || !timelineRef.current) return

//         const x = e.pageX
//         const distance = Math.abs(backgroundDragStartRef.current.x - x)

//         // Only start dragging if moved more than 5px
//         if (distance > 5 && !hasBackgroundDraggedRef.current) {
//             hasBackgroundDraggedRef.current = true
//             setIsDragging(true)
//             setIsPaused(true)
//         }

//         if (hasBackgroundDraggedRef.current) {
//             e.preventDefault()
//             const walk = (backgroundDragStartRef.current.x - x) * 2
//             timelineRef.current.scrollLeft =
//                 backgroundDragStartRef.current.scrollLeft + walk
//         }
//     }

//     const handleBackgroundDragMouseUp = () => {
//         if (hasBackgroundDraggedRef.current) {
//             setIsDragging(false)
//             setIsPaused(false)
//         }
//         hasBackgroundDraggedRef.current = false
//         backgroundDragStartRef.current = { x: 0, scrollLeft: 0 }
//     }

//     const handleBackgroundDragTouchStart = (e: React.TouchEvent) => {
//         if (!timelineRef.current) return
//         hasBackgroundDraggedRef.current = false
//         const touch = e.touches[0]
//         backgroundDragStartRef.current = {
//             x: touch.pageX,
//             scrollLeft: timelineRef.current.scrollLeft,
//         }
//     }

//     const handleBackgroundDragTouchMove = (e: React.TouchEvent) => {
//         if (!timelineRef.current || !backgroundDragStartRef.current.x) return

//         const touch = e.touches[0]
//         const x = touch.pageX
//         const distance = Math.abs(backgroundDragStartRef.current.x - x)

//         // Only start dragging if moved more than 5px
//         if (distance > 5 && !hasBackgroundDraggedRef.current) {
//             hasBackgroundDraggedRef.current = true
//             setIsDragging(true)
//             setIsPaused(true)
//         }

//         if (hasBackgroundDraggedRef.current) {
//             const walk = (backgroundDragStartRef.current.x - x) * 2
//             timelineRef.current.scrollLeft =
//                 backgroundDragStartRef.current.scrollLeft + walk
//         }
//     }

//     const handleBackgroundDragTouchEnd = () => {
//         if (hasBackgroundDraggedRef.current) {
//             setIsDragging(false)
//             setIsPaused(false)
//         }
//         hasBackgroundDraggedRef.current = false
//         backgroundDragStartRef.current = { x: 0, scrollLeft: 0 }
//     }

//     const handleMouseDown = (e: React.MouseEvent) => {
//         if (!timelineRef.current) return
//         hasDraggedRef.current = false
//         dragStartRef.current = {
//             x: e.pageX,
//             scrollLeft: timelineRef.current.scrollLeft,
//         }
//     }

//     const handleMouseMove = (e: React.MouseEvent) => {
//         if (!dragStartRef.current.x || !timelineRef.current) return

//         const x = e.pageX
//         const distance = Math.abs(dragStartRef.current.x - x)

//         // Only start dragging if moved more than 5px
//         if (distance > 5 && !hasDraggedRef.current) {
//             hasDraggedRef.current = true
//             setIsDragging(true)
//         }

//         if (hasDraggedRef.current) {
//             e.preventDefault()
//             const walk = (dragStartRef.current.x - x) * 2
//             timelineRef.current.scrollLeft =
//                 dragStartRef.current.scrollLeft + walk
//         }
//     }

//     const handleMouseUp = () => {
//         setIsDragging(false)
//         hasDraggedRef.current = false
//         dragStartRef.current = { x: 0, scrollLeft: 0 }
//     }

//     const handleMouseLeave = () => {
//         setIsDragging(false)
//         hasDraggedRef.current = false
//         dragStartRef.current = { x: 0, scrollLeft: 0 }
//     }

//     const handleTouchStart = (e: React.TouchEvent) => {
//         if (!timelineRef.current) return
//         hasDraggedRef.current = false
//         const touch = e.touches[0]
//         dragStartRef.current = {
//             x: touch.pageX,
//             scrollLeft: timelineRef.current.scrollLeft,
//         }
//     }

//     const handleTouchMove = (e: React.TouchEvent) => {
//         if (!timelineRef.current || !dragStartRef.current.x) return

//         const touch = e.touches[0]
//         const x = touch.pageX
//         const distance = Math.abs(dragStartRef.current.x - x)

//         // Only start dragging if moved more than 5px
//         if (distance > 5 && !hasDraggedRef.current) {
//             hasDraggedRef.current = true
//             setIsDragging(true)
//         }

//         if (hasDraggedRef.current) {
//             const walk = (dragStartRef.current.x - x) * 2
//             timelineRef.current.scrollLeft =
//                 dragStartRef.current.scrollLeft + walk
//         }
//     }

//     const handleTouchEnd = () => {
//         setIsDragging(false)
//         hasDraggedRef.current = false
//         dragStartRef.current = { x: 0, scrollLeft: 0 }
//     }

//     // Auto-hide timeline functionality
//     useEffect(() => {
//         if (isStatic) {
//             setIsTimelineVisible(true)
//             return
//         }

//         if (!timelineAutoHide) {
//             setIsTimelineVisible(true)
//             if (hideTimeoutRef.current !== null) {
//                 clearTimeout(hideTimeoutRef.current)
//                 hideTimeoutRef.current = null
//             }
//             return
//         }

//         const resetHideTimer = () => {
//             // Show timeline
//             startTransition(() => {
//                 setIsTimelineVisible(true)
//             })

//             // Clear existing timeout
//             if (hideTimeoutRef.current !== null) {
//                 clearTimeout(hideTimeoutRef.current)
//             }

//             // Set new timeout to hide timeline
//             hideTimeoutRef.current = window.setTimeout(() => {
//                 startTransition(() => {
//                     setIsTimelineVisible(false)
//                 })
//             }, timelineHideDelay * 1000)
//         }

//         // Initial timer
//         resetHideTimer()

//         // Add event listeners for user activity
//         const handleActivity = () => {
//             resetHideTimer()
//         }

//         window.addEventListener("mousemove", handleActivity)
//         window.addEventListener("touchstart", handleActivity)
//         window.addEventListener("touchmove", handleActivity)
//         window.addEventListener("click", handleActivity)

//         return () => {
//             if (hideTimeoutRef.current !== null) {
//                 clearTimeout(hideTimeoutRef.current)
//                 hideTimeoutRef.current = null
//             }
//             window.removeEventListener("mousemove", handleActivity)
//             window.removeEventListener("touchstart", handleActivity)
//             window.removeEventListener("touchmove", handleActivity)
//             window.removeEventListener("click", handleActivity)
//         }
//     }, [isStatic, timelineAutoHide, timelineHideDelay])

//     // Extract first frame from videos for thumbnails
//     useEffect(() => {
//         if (isStatic) return

//         const extractThumbnails = async () => {
//             const thumbnails: Record<number, string> = {}

//             for (let i = 0; i < safeImages.length; i++) {
//                 const item = safeImages[i]

//                 const vsrc = item?.videoUrl || item?.video
//                 if ((item?.type || "image") === "video" && vsrc) {
//                     try {
//                         const video = document.createElement("video")
//                         video.crossOrigin = "anonymous"
//                         video.src = vsrc
//                         video.muted = true
//                         video.playsInline = true
//                         video.preload = "metadata"

//                         const thumbnail = await new Promise<string | null>(
//                             (resolve) => {
//                                 let resolved = false
//                                 let timeoutId: number | null = null

//                                 const cleanup = () => {
//                                     if (!resolved) {
//                                         resolved = true
//                                         video.onloadeddata = null
//                                         video.onloadedmetadata = null
//                                         video.onseeked = null
//                                         video.onerror = null
//                                         if (timeoutId !== null) {
//                                             clearTimeout(timeoutId)
//                                         }
//                                         video.src = ""
//                                     }
//                                 }

//                                 video.onloadedmetadata = () => {
//                                     if (!resolved && video.duration > 0) {
//                                         video.currentTime = Math.min(
//                                             0.1,
//                                             video.duration / 10
//                                         )
//                                     }
//                                 }

//                                 video.onloadeddata = () => {
//                                     if (!resolved && video.readyState >= 2) {
//                                         video.currentTime = Math.min(
//                                             0.1,
//                                             video.duration / 10
//                                         )
//                                     }
//                                 }

//                                 video.onseeked = () => {
//                                     if (resolved) return

//                                     try {
//                                         const canvas =
//                                             document.createElement("canvas")
//                                         canvas.width = video.videoWidth || 640
//                                         canvas.height = video.videoHeight || 360
//                                         const ctx = canvas.getContext("2d")

//                                         if (
//                                             ctx &&
//                                             video.videoWidth > 0 &&
//                                             video.videoHeight > 0
//                                         ) {
//                                             ctx.drawImage(
//                                                 video,
//                                                 0,
//                                                 0,
//                                                 canvas.width,
//                                                 canvas.height
//                                             )
//                                             const dataUrl = canvas.toDataURL(
//                                                 "image/jpeg",
//                                                 0.7
//                                             )
//                                             cleanup()
//                                             resolve(dataUrl)
//                                         } else {
//                                             cleanup()
//                                             resolve(null)
//                                         }
//                                     } catch (error) {
//                                         console.error(
//                                             "Error extracting thumbnail:",
//                                             error
//                                         )
//                                         cleanup()
//                                         resolve(null)
//                                     }
//                                 }

//                                 video.onerror = () => {
//                                     console.error(
//                                         "Error loading video for thumbnail"
//                                     )
//                                     cleanup()
//                                     resolve(null)
//                                 }

//                                 // Timeout after 5 seconds
//                                 timeoutId = window.setTimeout(() => {
//                                     cleanup()
//                                     resolve(null)
//                                 }, 5000)
//                             }
//                         )

//                         if (thumbnail) {
//                             thumbnails[i] = thumbnail
//                         }
//                     } catch (error) {
//                         console.error(
//                             "Error processing video thumbnail:",
//                             error
//                         )
//                     }
//                 }
//             }

//             if (Object.keys(thumbnails).length > 0) {
//                 startTransition(() => {
//                     setVideoThumbnails(thumbnails)
//                 })
//             }
//         }

//         extractThumbnails()
//     }, [isStatic, safeImages])

//     return (
//         <div
//             ref={containerRef}
//             style={{
//                 position: "relative",
//                 width: "100%",
//                 height: "100%",
//                 overflow: "hidden",
//                 cursor: "default",
//             }}
//             onMouseDown={isStatic ? undefined : handleBackgroundMouseDown}
//             onMouseUp={isStatic ? undefined : handleBackgroundMouseUp}
//             onMouseLeave={isStatic ? undefined : handleBackgroundMouseUp}
//             onTouchStart={isStatic ? undefined : handleBackgroundTouchStart}
//             onTouchEnd={isStatic ? undefined : handleBackgroundTouchEnd}
//         >
//             {isStatic ? (
//                 // Canvas: static preview (no motion, no autoplay)
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: 0,
//                         left: 0,
//                         width: "100%",
//                         height: "100%",
//                         backgroundImage: mainSrc ? `url(${mainSrc})` : "none",
//                         backgroundSize:
//                             (activeImage?.imageFit || "fill") === "fill"
//                                 ? "cover"
//                                 : "auto 100%",
//                         backgroundPosition: "center",
//                         backgroundRepeat: "no-repeat",
//                         pointerEvents: "none",
//                     }}
//                 />
//             ) : (
//                 <AnimatePresence mode="sync">
//                     {!isVideo ? (
//                         <motion.div
//                             key={`image-${activeIndex}`}
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                             transition={{
//                                 duration,
//                                 ease: "easeInOut",
//                             }}
//                             style={{
//                                 position: "absolute",
//                                 top: 0,
//                                 left: 0,
//                                 width: "100%",
//                                 height: "100%",
//                                 backgroundImage: mainSrc
//                                     ? `url(${mainSrc})`
//                                     : "none",
//                                 backgroundSize:
//                                     (activeImage?.imageFit || "fill") === "fill"
//                                         ? "cover"
//                                         : "auto 100%",
//                                 backgroundPosition: "center",
//                                 backgroundRepeat: "no-repeat",
//                                 userSelect: "none",
//                                 pointerEvents: "none",
//                             }}
//                             onContextMenu={(e) => e.preventDefault()}
//                         />
//                     ) : videoSrc ? (
//                         <motion.video
//                             key={`video-${activeIndex}`}
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                             transition={{
//                                 duration: transitionDuration,
//                                 ease: "easeInOut",
//                             }}
//                             src={videoSrc}
//                             poster={mainSrc}
//                             autoPlay={!isStatic}
//                             loop
//                             muted
//                             playsInline
//                             style={{
//                                 position: "absolute",
//                                 top: 0,
//                                 left: 0,
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit:
//                                     (activeImage?.imageFit || "fill") === "fit"
//                                         ? "contain"
//                                         : "cover",
//                                 objectPosition: "center",
//                                 userSelect: "none",
//                                 pointerEvents: "none",
//                             }}
//                             onContextMenu={(e) => e.preventDefault()}
//                         />
//                     ) : (
//                         <motion.div
//                             key={`poster-${activeIndex}`}
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                             transition={{
//                                 duration: transitionDuration,
//                                 ease: "easeInOut",
//                             }}
//                             style={{
//                                 position: "absolute",
//                                 top: 0,
//                                 left: 0,
//                                 width: "100%",
//                                 height: "100%",
//                                 backgroundImage: mainSrc
//                                     ? `url(${mainSrc})`
//                                     : "none",
//                                 backgroundSize: "cover",
//                                 backgroundPosition: "center",
//                                 backgroundRepeat: "no-repeat",
//                                 pointerEvents: "none",
//                             }}
//                         />
//                     )}
//                 </AnimatePresence>
//             )}

//             <div
//                 style={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     width: "100%",
//                     height: "100%",
//                     backgroundColor: `rgba(0,0,0,${overlayOpacity})`,
//                     pointerEvents: "none",
//                 }}
//             />

//             {!isStatic && (
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: 0,
//                         left: 0,
//                         width: "100%",
//                         height: "100%",
//                         cursor: isDragging ? "grabbing" : "grab",
//                     }}
//                     onMouseDown={handleBackgroundDragMouseDown}
//                     onMouseMove={handleBackgroundDragMouseMove}
//                     onMouseUp={handleBackgroundDragMouseUp}
//                     onMouseLeave={handleBackgroundDragMouseUp}
//                     onTouchStart={handleBackgroundDragTouchStart}
//                     onTouchMove={handleBackgroundDragTouchMove}
//                     onTouchEnd={handleBackgroundDragTouchEnd}
//                 />
//             )}

//             <div
//                 ref={timelineRef}
//                 className="ihg-timeline"
//                 onMouseDown={handleMouseDown}
//                 onMouseMove={handleMouseMove}
//                 onMouseUp={handleMouseUp}
//                 onMouseLeave={handleMouseLeave}
//                 onTouchStart={handleTouchStart}
//                 onTouchMove={handleTouchMove}
//                 onTouchEnd={handleTouchEnd}
//                 style={{
//                     position: "absolute",
//                     ...(timelinePosition === "bottom"
//                         ? { bottom: timelineBottomPadding }
//                         : { top: timelineBottomPadding }),
//                     left: 0,
//                     width: "100%",
//                     height: itemSize,
//                     overflowX: "auto",
//                     overflowY: "hidden",
//                     display: "flex",
//                     alignItems: "center",
//                     paddingLeft: "50%",
//                     paddingRight: "50%",
//                     scrollbarWidth: "none",
//                     msOverflowStyle: "none",
//                     pointerEvents: isStatic ? "none" : "auto",
//                     cursor: isStatic
//                         ? "default"
//                         : isDragging
//                           ? "grabbing"
//                           : "grab",
//                     userSelect: "none",
//                     opacity: isTimelineVisible ? 1 : 0,
//                     transition: isStatic ? "none" : "opacity 0.3s ease",
//                 }}
//             >
//                 <style>
//                     {`
//     .ihg-timeline::-webkit-scrollbar {
//         display: none;
//     }
// `}
//                 </style>
//                 <div
//                     style={{
//                         display: "flex",
//                         gap: itemSpacing,
//                     }}
//                 >
//                     {duplicatedImages.map((item, index) => {
//                         const originalIndex = index % safeImages.length
//                         const isActive = originalIndex === activeIndex
//                         const isVideo = (item?.type || "image") === "video"
//                         const itemSrc = getImageSrc(item?.image)
//                         const thumbnailSrc = isVideo
//                             ? videoThumbnails[originalIndex] || itemSrc
//                             : itemSrc

//                         return (
//                             <div
//                                 key={index}
//                                 style={{
//                                     width: itemSize,
//                                     height: itemSize,
//                                     flexShrink: 0,
//                                     borderRadius: itemBorderRadius,
//                                     overflow: "hidden",
//                                     opacity: isActive
//                                         ? 1
//                                         : timelineImageOpacity / 100,
//                                     transition: isStatic
//                                         ? "none"
//                                         : `opacity ${transitionDuration}s ease, filter ${transitionDuration}s ease`,

//                                     boxShadow: isActive
//                                         ? "0 8px 24px rgba(0, 0, 0, 0.3)"
//                                         : "0 2px 8px rgba(0, 0, 0, 0.2)",
//                                 }}
//                             >
//                                 <img
//                                     src={thumbnailSrc || ""}
//                                     alt={getImageAlt(item?.image) || ""}
//                                     style={{
//                                         width: "100%",
//                                         height: "100%",
//                                         objectFit: "cover",
//                                         pointerEvents: "none",
//                                         filter: isActive
//                                             ? "saturate(100%)"
//                                             : `saturate(${timelineImageSaturation}%)`,
//                                         transition: isStatic
//                                             ? "none"
//                                             : `filter ${duration}s ease`,

//                                         WebkitTouchCallout: "none",
//                                         WebkitUserSelect: "none",
//                                         userSelect: "none",
//                                     }}
//                                     onContextMenu={(e) => e.preventDefault()}
//                                     draggable={false}
//                                 />
//                             </div>
//                         )
//                     })}
//                 </div>
//             </div>
//         </div>
//     )
// }

// InteractiveHeroGallery.defaultProps = {
//     images: DEFAULT_IMAGES,
//     itemSize: 70,
//     itemSpacing: 0,
//     transitionDuration: 0,
//     overlayOpacity: 0,
//     autoScrollSpeed: 1,
//     itemBorderRadius: 0,
//     timelineBottomPadding: 0,
//     timelineImageOpacity: 100,
//     timelineImageSaturation: 100,
//     timelinePosition: "bottom",
//     timelineAutoHide: true,
//     timelineHideDelay: 3,
// }

// addPropertyControls(InteractiveHeroGallery, {
//     // Images Section
//     images: {
//         type: ControlType.Array,
//         title: "Images",
//         control: {
//             type: ControlType.Object,
//             controls: {
//                 type: {
//                     type: ControlType.Enum,
//                     title: "Type",
//                     options: ["image", "video"],
//                     optionTitles: ["Image", "Video"],
//                     defaultValue: "image",
//                     displaySegmentedControl: true,
//                 },
//                 image: {
//                     type: ControlType.ResponsiveImage,
//                     title: "Poster / Fallback",
//                     //! non nasconderla mai: serve anche per i video!!
//                 },
//                 videoUrl: {
//                     type: ControlType.String,
//                     title: "Video URL",
//                     placeholder: "https://…/video.mp4 (direct file URL)",
//                     hidden: ({ type }) => type !== "video",
//                 },
//                 video: {
//                     type: ControlType.File,
//                     title: "Video File",
//                     allowedFileTypes: ["mp4", "webm", "mov"],
//                     hidden: ({ type }) => type !== "video",
//                 },
//                 imageFit: {
//                     type: ControlType.Enum,
//                     title: "Image Fit",
//                     options: ["fill", "fit"],
//                     optionTitles: ["Fill", "Fit"],
//                     defaultValue: "fill",
//                     displaySegmentedControl: true,
//                 },
//             },
//         },
//         defaultValue: [
//             {
//                 type: "image",
//                 image: {
//                     src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
//                     alt: "Image 1",
//                 },
//                 video: "https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4",
//                 imageFit: "fill",
//             },
//             {
//                 type: "image",
//                 image: {
//                     src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
//                     alt: "Image 2",
//                 },
//                 video: "https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4",
//                 imageFit: "fill",
//             },
//             {
//                 type: "image",
//                 image: {
//                     src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
//                     alt: "Image 3",
//                 },
//                 video: "https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4",
//                 imageFit: "fill",
//             },
//             {
//                 type: "image",
//                 image: {
//                     src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
//                     alt: "Image 4",
//                 },
//                 video: "https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4",
//                 imageFit: "fill",
//             },
//             {
//                 type: "image",
//                 image: {
//                     src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
//                     alt: "Image 5",
//                 },
//                 video: "https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4",
//                 imageFit: "fill",
//             },
//             {
//                 type: "image",
//                 image: {
//                     src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
//                     alt: "Image 5",
//                 },
//                 video: "https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4",
//                 imageFit: "fill",
//             },
//         ],
//     },
//     itemSize: {
//         type: ControlType.Number,
//         title: "Images Size",
//         defaultValue: 70,
//         min: 60,
//         max: 200,
//         step: 10,
//         unit: "px",
//     },
//     itemSpacing: {
//         type: ControlType.Number,
//         title: "Images Spacing",
//         defaultValue: 0,
//         min: 0,
//         max: 64,
//         step: 4,
//         unit: "px",
//     },
//     itemBorderRadius: {
//         type: ControlType.Number,
//         title: "Corner Radius",
//         defaultValue: 0,
//         min: 0,
//         max: 60,
//         step: 1,
//         unit: "px",
//     },
//     transitionDuration: {
//         type: ControlType.Number,
//         title: "Transition Duration",
//         defaultValue: 0,
//         min: 0,
//         max: 2,
//         step: 0.1,
//         unit: "s",
//     },
//     overlayOpacity: {
//         type: ControlType.Number,
//         title: "Overlay Opacity",
//         defaultValue: 0,
//         min: 0,
//         max: 1,
//         step: 0.05,
//     },
//     autoScrollSpeed: {
//         type: ControlType.Number,
//         title: "Auto Scroll Speed",
//         defaultValue: 1,
//         min: 0,
//         max: 10,
//         step: 1,
//     },
//     timelinePosition: {
//         type: ControlType.Enum,
//         title: "Timeline Position",
//         options: ["bottom", "top"],
//         optionTitles: ["Bottom", "Top"],
//         defaultValue: "bottom",
//         displaySegmentedControl: true,
//     },
//     timelineBottomPadding: {
//         type: ControlType.Number,
//         title: "Timeline Padding",
//         defaultValue: 0,
//         min: 0,
//         max: 200,
//         step: 5,
//         unit: "px",
//     },
//     timelineImageOpacity: {
//         type: ControlType.Number,
//         title: "Timeline Image Opacity",
//         defaultValue: 100,
//         min: 0,
//         max: 100,
//         step: 5,
//         unit: "%",
//     },
//     timelineImageSaturation: {
//         type: ControlType.Number,
//         title: "Timeline Image Saturation",
//         defaultValue: 100,
//         min: 0,
//         max: 100,
//         step: 5,
//         unit: "%",
//     },
//     timelineAutoHide: {
//         type: ControlType.Boolean,
//         title: "Timeline Auto Hide",
//         defaultValue: true,
//         enabledTitle: "On",
//         disabledTitle: "Off",
//     },
//     timelineHideDelay: {
//         type: ControlType.Number,
//         title: "Hide Delay",
//         defaultValue: 3,
//         min: 1,
//         max: 10,
//         step: 1,
//         unit: "s",
//         hidden: ({ timelineAutoHide }) => !timelineAutoHide,
//     },
// })
