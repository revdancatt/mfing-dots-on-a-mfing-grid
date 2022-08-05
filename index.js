/* global preloadImagesTmr fxhash fxrand paper1Loaded page */

//
//  fxhash - M'Fing Dots on a M'Fing Grid
//
//
//  HELLO!! Code is copyright revdancatt (that's me), so no sneaky using it for your
//  NFT projects.
//  But please feel free to unpick it, and ask me questions. A quick note, this is written
//  as an artist, which is a slightly different (and more storytelling way) of writing
//  code, than if this was an engineering project. I've tried to keep it somewhat readable
//  rather than doing clever shortcuts, that are cool, but harder for people to understand.
//
//  Repo at: https://github.com/revdancatt/mfing-dots-on-a-mfing-grid
//
//  You can find me at...
//  https://twitter.com/revdancatt
//  https://instagram.com/revdancatt
//  https://youtube.com/revdancatt
//

const ratio = 1
// const startTime = new Date().getTime() // so we can figure out how long since the scene started
let drawn = false
let highRes = false // display high or low res
const features = {}
const nextFrame = null
let resizeTmr = null

window.$fxhashFeatures = {
  Type: 'Speedrun %any < 720'
}

//  Lets make our own lerp function, because we need it
//  to be fast, and not use Math.lerp, which is slow
const lerp = (a, b, p) => {
  return a + (b - a) * p
}

//  Work out what all our features are
const makeFeatures = () => {
  // features.background = 1
  features.paperOffset = {
    paper1: {
      x: fxrand(),
      y: fxrand()
    },
    paper2: {
      x: fxrand(),
      y: fxrand()
    }
  }

  //  Set the defaults, and if we are allowed to vary between dots

  //  The default size of the dots
  features.defaultSize = fxrand() * 0.2 + 0.6
  features.allowSizeVariation = fxrand() < 0.1

  //  The lineyness of the dots
  features.defaultLiney = fxrand() * 2.5 + 2
  features.allowLineVariation = fxrand() < 0.25

  //  The breakness of the dots
  features.defaultBreak = fxrand() * 0.01 + 0.01
  features.allowBreakVariation = fxrand() < 0.25

  //  The smoothness of the dots
  features.defaultResolution = 10
  features.defaultAmplitude = 0
  features.shape = 'Smooth'
  //  There is a chance we we will not be smooth
  if (fxrand() < 0.28) {
    features.defaultResolution = 1
    features.defaultAmplitude = 0.05
    features.shape = 'Careless'
    //  Even less smooth
    if (fxrand() < 0.3) {
      features.defaultResolution = 0.8
      features.defaultAmplitude = 0.1
      features.shape = 'Messy'
      if (fxrand() < 0.2) {
        features.defaultResolution = 0.1
        features.defaultAmplitude = 0.1
        features.shape = 'Inky'
      }
    }
  }
  features.allowSmoothVariation = fxrand() < 0.15
  features.allowOffsetVariation = fxrand() < 0.1
  features.shuffly = fxrand() < 0.08

  /*
  // Debug
  features.defaultSize = 0.8
  features.allowSizeVariation = false
  features.defaultResolution = 0.8
  features.defaultAmplitude = 0.1
  features.allowSmoothVariation = false
  features.allowOffsetVariation = true
  */

  //  Make a number of grid size, anywhere from 3 to 9
  features.grid = Math.floor(fxrand() * 6) + 3
  //  If we have the values 3 to 12, it means each one will turn up 100/9 % of the time
  //  11.1111%
  //  But sometimes, far less often we want either 1 or 2 to show up
  if (fxrand() < 0.06) { // 6%
    //  Mostly 2
    features.grid = 2
    //  Sometimes 1
    if (fxrand() < 0.2) features.grid = 1
  }
  if (features.shuffly) features.grid *= 2
  // features.grid = 1

  //  Now calculate the dot sizes and wobblyness and other features
  features.dots = {}

  features.colourStrategey = 'Random'
  features.colourBand = '360'

  //  Do two bands
  if (fxrand() < 0.6) {
    features.colourStrategey = 'Duel Band'
    features.colourBand = 'Wide'
    if (fxrand() < 0.75) features.colourBand = 'Narrow'
  }

  //  Maybe do a single band
  if (fxrand() < 0.15) {
    features.colourStrategey = 'Single Band'
    features.colourBand = 'Wide'
    if (fxrand() < 0.75) features.colourBand = 'Narrow'
  }

  //  Do three bands
  if (fxrand() < 0.1) {
    features.colourStrategey = 'Tri Band'
    features.colourBand = 'Narrow'
  }

  //  Define the colours and ranges
  const startPoint1 = fxrand() * 360
  let startPoint2 = fxrand() * 360
  let startPoint3 = fxrand() * 360
  let startPoints = [startPoint1, startPoint2, startPoint3]

  const brightPoint1 = fxrand() < 0.8
  const brightPoint2 = fxrand() < 0.5
  const brightPoint3 = fxrand() < 0.2
  let brightPoints = [brightPoint1, brightPoint2, brightPoint3]

  let width = 360

  //  If we are doing a single band
  if (features.colourStrategey === 'Single Band') {
    startPoints = [startPoint1]
    brightPoints = [brightPoint1]
    width = 60
    if (features.colourBand === 'Narrow') width = 30
  }

  //  If we are doing a duel band
  if (features.colourStrategey === 'Duel Band') {
    //  Default to oppposite bands
    startPoint2 = startPoint1 + 180
    //  Some of the time go adjacent not opposite
    if (fxrand() < 0.5) {
      startPoint2 = startPoint1 + 120
      if (fxrand() < 0.5) startPoint2 = startPoint1 + 240
    }

    startPoints = [startPoint1, startPoint2]
    brightPoints = [brightPoint1, brightPoint2]
    width = 60
    if (features.colourBand === 'Narrow') width = 30
  }

  //  If we are doing a tri band
  if (features.colourStrategey === 'Tri Band') {
    //  Default to oppposite bands
    startPoint2 = startPoint1 + 120
    startPoint3 = startPoint1 + 240
    startPoints = [startPoint1, startPoint2, startPoint3]
    brightPoints = [brightPoint1, brightPoint2, brightPoint3]
    width = 60
    if (features.colourBand === 'Narrow') width = 30
  }

  //  There is a chance we use the black except for one colour
  if (fxrand() < 0.05) {
    features.colourStrategey = 'Black But One'
    if (features.grid < 4) features.grid = 4
    //  Increase the chance of it being offgrid
    if (fxrand() < 0.3) features.shuffly = true
  }

  features.shrinky = false
  if (!features.shuffly && features.grid > 2) features.shrinky = fxrand() < 0.08

  //  Predfine the colours for the dots
  for (let y = 0; y < features.grid; y++) {
    for (let x = 0; x < features.grid; x++) {
      features.dots[`${x},${y}`] = {}
      const choice = Math.floor(fxrand() * startPoints.length)
      features.dots[`${x},${y}`].colour = {
        h: Math.floor(startPoints[choice] + ((fxrand() * width) - (width / 2))),
        s: fxrand() * 30 + 30,
        l: fxrand() * 80 + 10
      }
      while (features.dots[`${x},${y}`].colour.h < 0) features.dots[`${x},${y}`].colour.h += 360
      while (features.dots[`${x},${y}`].colour.h > 359) features.dots[`${x},${y}`].colour.h -= 360
      //  do the saturation
      if (brightPoints[choice]) features.dots[`${x},${y}`].colour.s = 100
    }
  }

  //  If we are black but one, then we set everything to black, except for one dot
  if (features.colourStrategey === 'Black But One') {
    const saveDot = `${Math.floor(fxrand() * (features.grid - 2)) + 1},${Math.floor(fxrand() * (features.grid - 2)) + 1}`
    for (let y = 0; y < features.grid; y++) {
      for (let x = 0; x < features.grid; x++) {
        //  If it's not the save dot
        if (`${x},${y}` !== saveDot) {
          features.dots[`${x},${y}`].colour.l = 0
        } else {
          features.dots[`${x},${y}`].colour.s = 100
          features.dots[`${x},${y}`].colour.l = 50
        }
      }
    }
  }

  if (features.shuffly) {
    features.allowOffsetVariation = true
  }

  //  We're also going to make some circles in a circle store, based on percentages from 1 to 100
  //  this is because I'm going to display the circles and want to have a variety of them at each
  //  level, but we need to have less segments as we go down the range
  let maxSegments = 360
  let minSegments = 18

  features.altShape = 'No'
  if (fxrand() < 0.08) {
    features.altShape = 'Square'
    maxSegments = 4
    minSegments = 4
    features.defaultBreak = -1
    features.allowBreakVariation = false
    features.shapeRotation = 0
    if (fxrand() < 0.5) features.shapeRotation = 45
    //  Sometimes we have a hexagon, of course
    if (fxrand() < 0.4) {
      features.altShape = 'Hexagon'
      maxSegments = 6
      minSegments = 6
      features.shapeRotation = 0
    }
  }

  for (let y = 0; y < features.grid; y++) {
    for (let x = 0; x < features.grid; x++) {
      features.dots[`${x},${y}`].outerSize = features.defaultSize
      features.dots[`${x},${y}`].resolution = features.defaultResolution
      features.dots[`${x},${y}`].amplitude = features.defaultAmplitude
      features.dots[`${x},${y}`].liney = features.defaultLiney
      features.dots[`${x},${y}`].break = features.defaultBreak
      features.dots[`${x},${y}`].offset = {
        x: 0,
        y: 0
      }
      features.dots[`${x},${y}`].breaks = []
      //  If we allow line thickness variation between dots that that
      if (features.allowLineVariation) features.dots[`${x},${y}`].liney = fxrand() * 2 + 2
      //  If we allow break variation between dots that that
      if (features.allowBreakVariation) features.dots[`${x},${y}`].break = fxrand() * 0.09 + 0.01
      //  If we allow size variation between dots that that
      if (features.allowSizeVariation) features.dots[`${x},${y}`].outerSize = fxrand() * 0.2 + 0.6
      //  If we allow smooth variation between dots that that
      if (features.allowSmoothVariation) {
        features.dots[`${x},${y}`].resolution = 10
        features.defaultAmplitude = 0
        features.shape = 'smooth'
        //  There is a chance we we will not be smooth
        if (fxrand() < 0.333) {
          features.dots[`${x},${y}`].resolution = 1
          features.dots[`${x},${y}`].amplitude = 0.05
          //  Even less smooth
          if (fxrand() < 0.3) {
            features.dots[`${x},${y}`].resolution = 0.8
            features.dots[`${x},${y}`].amplitude = 0.1
            if (fxrand() < 0.2) {
              features.dots[`${x},${y}`].resolution = 0.1
              features.dots[`${x},${y}`].amplitude = 0.1
            }
          }
        }
      }
      //  If offset variation is allowed
      if (features.allowOffsetVariation) {
        features.dots[`${x},${y}`].offset.x = fxrand() * 0.1 - 0.05
        features.dots[`${x},${y}`].offset.y = fxrand() * 0.1 - 0.05
      }

      // Try to pull back some of the edge cases.
      if (features.dots[`${x},${y}`].outerSize > 0.75 && features.dots[`${x},${y}`].break && features.dots[`${x},${y}`].resolution === 0.8) {
        features.dots[`${x},${y}`].outerSize = 0.75
      }
    }
  }

  //  Now add a circle to dotCircles from the circleStore
  const numberOfRings = Math.floor(100 / features.grid)
  for (let y = 0; y < features.grid; y++) {
    for (let x = 0; x < features.grid; x++) {
      //  We are going to have an array of circles
      features.dots[`${x},${y}`].circles = []
      features.dots[`${x},${y}`].colour.dark = []
      features.dots[`${x},${y}`].colour.medium = []
      features.dots[`${x},${y}`].colour.light = []

      //  Now add the circles to the array for the number of rings we have
      for (let i = 0; i < numberOfRings; i++) {
        //  work out the percentage of the circle we are at
        const percent = Math.floor((i + 1) * (100 / numberOfRings))
        const segments = Math.floor(lerp(minSegments, maxSegments, percent / 100))
        const displacement = {
          xShift: 0,
          yShift: 0,
          direction: 'normal',
          weighting: 1,
          invert: false,
          xNudge: fxrand() * 1000 + 1500,
          yNudge: fxrand() * 1000 + 2000,
          zNudge: 0,
          xScale: 1,
          yScale: 1,
          zScale: 1,
          resolution: features.dots[`${x},${y}`].resolution,
          amplitude: features.dots[`${x},${y}`].amplitude
        }
        let thisCircle = page.displace(page.makeCircle(segments, 1), displacement)
        //  If we are not using an alt shape then we can rotate the circle
        if (features.altShape === 'No') {
          thisCircle = page.rotate(thisCircle, fxrand() * 360)
        } else {
          thisCircle = page.rotate(thisCircle, features.shapeRotation)
        }
        features.dots[`${x},${y}`].circles.push(thisCircle[0].points)

        // Work out if we are going to break or now.
        const newBreak = {
          start: 1,
          end: 1
        }
        //  If we break then do that here
        if (fxrand() < features.dots[`${x},${y}`].break) {
          console.log('breaking')
          newBreak.start += fxrand() * 0.2
          newBreak.end -= fxrand() * 0.5
        }

        features.dots[`${x},${y}`].breaks.push(newBreak)

        //  Now do some colour adjustments
        //  Grab a new hue
        let newHue = Math.floor(features.dots[`${x},${y}`].colour.h + fxrand() * 6 - 3)

        //  Wrap it around the end of the spectrum
        while (newHue > 359) newHue -= 360
        while (newHue < 0) newHue += 360
        //  Create a new medium saturation
        const midSat = Math.max(Math.min(features.dots[`${x},${y}`].colour.s + fxrand() * 0 - 0, 100), 0)
        const midLum = Math.max(Math.min(features.dots[`${x},${y}`].colour.l + fxrand() * 0 - 0, 100), 0)
        //  Make a new darker lum
        const darkLum = Math.max(Math.min(midLum - (fxrand() * 8), 100), 0)
        const lightLum = Math.max(Math.min(midLum + (fxrand() * 2), 100), 0)
        //  Add the dark colour
        features.dots[`${x},${y}`].colour.dark.push({
          h: newHue,
          s: midSat,
          l: darkLum,
          show: fxrand() < 0.6
        })
        //  Add the medium colour
        features.dots[`${x},${y}`].colour.medium.push({
          h: newHue,
          s: midSat,
          l: midLum,
          show: fxrand() < 0.9
        })
        //  Add the light colour
        features.dots[`${x},${y}`].colour.light.push({
          h: newHue,
          s: midSat,
          l: lightLum,
          show: fxrand() < 0.9
        })
      }
    }
  }

  window.$fxhashFeatures['Grid Size'] = features.grid
  window.$fxhashFeatures.Dots = features.grid * features.grid
  window.$fxhashFeatures['Variable Sizes'] = features.allowSizeVariation
  window.$fxhashFeatures['Variable Line Width'] = features.allowLineVariation
  window.$fxhashFeatures['Dot Shapes'] = features.shape
  window.$fxhashFeatures['Alt Shapes'] = features.altShape
  if (features.allowSmoothVariation) window.$fxhashFeatures['Dot Shapes'] = 'Random'
  window.$fxhashFeatures.Misaligned = features.allowOffsetVariation
  window.$fxhashFeatures['Off Grid'] = features.shuffly
  window.$fxhashFeatures.Inset = features.shrinky
  window.$fxhashFeatures['Colour Strategey'] = features.colourStrategey
  window.$fxhashFeatures['Colour Selection Band'] = features.colourBand
}

//  Call the above make features, so we'll have the window.$fxhashFeatures available
//  for fxhash
makeFeatures()
console.log(features)
console.table(window.$fxhashFeatures)

const init = async () => {
  //  I should add a timer to this, but really how often to people who aren't
  //  the developer resize stuff all the time. Stick it in a digital frame and
  //  have done with it!
  window.addEventListener('resize', async () => {
    clearTimeout(resizeTmr)
    resizeTmr = setTimeout(layoutCanvas, 100)
  })

  //  Now layout the canvas
  await layoutCanvas()
}

const layoutCanvas = async () => {
  //  Kill the next animation frame
  window.cancelAnimationFrame(nextFrame)

  const wWidth = window.innerWidth
  const wHeight = window.innerHeight
  let cWidth = wWidth
  let cHeight = cWidth * ratio
  if (cHeight > wHeight) {
    cHeight = wHeight
    cWidth = wHeight / ratio
  }
  const canvas = document.getElementById('target')
  if (highRes) {
    canvas.height = 8192
    canvas.width = 8192 / ratio
  } else {
    canvas.width = Math.min((8192 / 2), cWidth * 2)
    canvas.height = Math.min((8192 / ratio / 2), cHeight * 2)
    //  Minimum size to be half of the high rez cersion
    if (Math.min(canvas.width, canvas.height) < 8192 / 2) {
      if (canvas.width < canvas.height) {
        canvas.height = 8192 / 2
        canvas.width = 8192 / 2 / ratio
      } else {
        canvas.width = 8192 / 2
        canvas.height = 8192 / 2 / ratio
      }
    }
  }

  canvas.style.position = 'absolute'
  canvas.style.width = `${cWidth}px`
  canvas.style.height = `${cHeight}px`
  canvas.style.left = `${(wWidth - cWidth) / 2}px`
  canvas.style.top = `${(wHeight - cHeight) / 2}px`

  //  Re-Create the paper pattern
  const paper1 = document.createElement('canvas')
  paper1.width = canvas.width / 2
  paper1.height = canvas.height / 2
  const paper1Ctx = paper1.getContext('2d')
  await paper1Ctx.drawImage(paper1Loaded, 0, 0, 1920, 1920, 0, 0, paper1.width, paper1.height)
  features.paper1Pattern = paper1Ctx.createPattern(paper1, 'repeat')

  const paper2 = document.createElement('canvas')
  paper2.width = canvas.width / (22 / 7)
  paper2.height = canvas.height / (22 / 7)
  const paper2Ctx = paper2.getContext('2d')
  await paper2Ctx.drawImage(paper1Loaded, 0, 0, 1920, 1920, 0, 0, paper2.width, paper2.height)
  features.paper2Pattern = paper2Ctx.createPattern(paper2, 'repeat')

  //  And draw it!!
  drawCanvas()
}

const drawCanvas = async () => {
  //  Let the preloader know that we've hit this function at least once
  drawn = true
  //  Make sure there's only one nextFrame to be called
  window.cancelAnimationFrame(nextFrame)

  // Grab all the canvas stuff
  const canvas = document.getElementById('target')
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  //  Lay down the first paper texture
  ctx.fillStyle = features.paper1Pattern

  ctx.save()
  ctx.translate(-w * features.paperOffset.paper1.x, -h * features.paperOffset.paper1.y)
  ctx.fillRect(0, 0, w * 2, h * 2)
  ctx.restore()

  //  Lay down the second paper texture
  ctx.globalCompositeOperation = 'darken'
  ctx.fillStyle = features.paper2Pattern

  ctx.save()
  ctx.translate(-w * features.paperOffset.paper1.x, -h * features.paperOffset.paper1.y)
  ctx.fillRect(0, 0, w * 2, h * 2)
  ctx.restore()

  ctx.globalCompositeOperation = 'source-over'

  //  Draw the grid
  /*
  ctx.strokeStyle = '#AAA'
  ctx.lineWidth = w / 1000
  for (let i = 0; i < features.grid; i++) {
    ctx.beginPath()
    ctx.moveTo(w / features.grid * i, 0)
    ctx.lineTo(w / features.grid * i, h)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, h / features.grid * i)
    ctx.lineTo(w, h / features.grid * i)
    ctx.stroke()
  }
  */

  /*
    Now we want to make the "dots".

    To do this we are going to create an offscreen canvas the size of a single grid tile
    and then draw to the dot to it. Then we can copy the dot over to here using a blend mode.
  */

  ctx.save()
  if (features.shuffly) {
    const amount = 0.85
    ctx.translate((w - (w * amount)) / 2, (w - (w * amount)) / 2)
    ctx.scale(amount, amount)
  }

  if (features.shrinky) {
    const amount = 0.666
    ctx.translate((w - (w * amount)) / 2, (w - (w * amount)) / 2)
    ctx.scale(amount, amount)
  }

  // Create the offscreen canvas
  const gridSize = w / features.grid
  //  Create a hidden canvas we can use to draw to
  const dotCanvas = document.createElement('canvas')
  dotCanvas.width = gridSize
  dotCanvas.height = gridSize
  const dotCtx = dotCanvas.getContext('2d')

  //  Set the origin to the center of the tile
  dotCtx.save()
  dotCtx.translate(gridSize / 2, gridSize / 2)

  //  Draw the dot to the canvas looping over the grid
  for (let y = 0; y < features.grid; y++) {
    for (let x = 0; x < features.grid; x++) {
      //  Fill the dot tile with white
      /*
      dotCtx.fillStyle = '#FFF'
      dotCtx.fillRect(-gridSize / 2, -gridSize / 2, gridSize, gridSize)
      */
      dotCtx.clearRect(-gridSize / 2, -gridSize / 2, gridSize, gridSize)

      //  Now draw a circle in a random colour for debugging
      const sizeMod = gridSize / 2
      //  Grab the rings that have been stored for this circle
      const theseRings = features.dots[`${x},${y}`].circles
      const theseBreaks = features.dots[`${x},${y}`].breaks
      const theseDark = features.dots[`${x},${y}`].colour.dark
      const theseMedium = features.dots[`${x},${y}`].colour.medium
      const theseLight = features.dots[`${x},${y}`].colour.light
      const maxRings = theseRings.length
      const outerSizeMod = features.dots[`${x},${y}`].outerSize
      const innerSizeMod = 0.0
      const baseLineSize = gridSize / 2 * outerSizeMod / maxRings * features.dots[`${x},${y}`].liney

      //  Loop through the rings
      const shades = [theseDark, theseMedium, theseLight]
      const alphas = [1, 0.8, 0.8]
      const lineMod = [0.8, 1, 0.1]
      //  Loop through the shades
      for (let s = 0; s < shades.length; s++) {
        const thisShade = shades[s]
        // ctx.globalAlpha = alphas[s]

        for (let i = 0; i < maxRings; i++) {
          //  Grab the ring
          const ring = theseRings[i]
          const thisBreak = theseBreaks[i]
          const shade = thisShade[i]

          //  If we are supposed to show this one then we do it
          if (shade.show) {
            //  Work out the percent of the way through we are
            const percent = i / maxRings
            //  Grab the size mod we need to use, so we can scale the rings down from small to large
            const thisSizeMod = sizeMod * lerp(innerSizeMod, outerSizeMod, percent) - 0.01

            dotCtx.lineWidth = baseLineSize * lineMod[s]
            dotCtx.lineJoin = 'round'
            dotCtx.lineCap = 'round'
            // const col = features.dots[`${x},${y}`].colour
            dotCtx.strokeStyle = `hsla(${shade.h}, ${shade.s}%, ${shade.l}%, ${alphas[s]})`
            dotCtx.beginPath()
            //  Grab the first x and y position
            dotCtx.moveTo(ring[0].x * thisSizeMod * thisBreak.start, ring[0].y * thisSizeMod * thisBreak.start)
            //  Loop thru the rest of the points in the dotCircle array
            for (let i = 1; i < ring.length; i++) {
              const percent = i / ring.length
              const pointSizeMod = lerp(thisBreak.start, thisBreak.end, percent)
              dotCtx.lineTo(ring[i].x * thisSizeMod * pointSizeMod, ring[i].y * thisSizeMod * pointSizeMod)
            }
            dotCtx.stroke()
          }
        }
      }

      const offsetMod = {
        x: features.dots[`${x},${y}`].offset.x,
        y: features.dots[`${x},${y}`].offset.y
      }
      if (features.shuffly) {
        offsetMod.x *= 6
        offsetMod.y *= 6
      }

      dotCtx.globalAlpha = 1
      ctx.save()
      ctx.translate(w / features.grid * x + (gridSize * offsetMod.x), h / features.grid * y + (gridSize * offsetMod.y))

      ctx.globalCompositeOperation = 'multiply'
      ctx.drawImage(dotCanvas, 0, 0)
      ctx.restore()
    }
  }
  dotCtx.restore()

  ctx.restore()
}

const autoDownloadCanvas = async (showHash = false) => {
  const element = document.createElement('a')
  element.setAttribute('download', `MFing_Dots_on_a_MFing_Grid_${fxhash}`)
  element.style.display = 'none'
  document.body.appendChild(element)
  let imageBlob = null
  imageBlob = await new Promise(resolve => document.getElementById('target').toBlob(resolve, 'image/png'))
  element.setAttribute('href', window.URL.createObjectURL(imageBlob, {
    type: 'image/png'
  }))
  element.click()
  document.body.removeChild(element)
}

//  KEY PRESSED OF DOOM
document.addEventListener('keypress', async (e) => {
  e = e || window.event
  // Save
  if (e.key === 's') autoDownloadCanvas()

  //   Toggle highres mode
  if (e.key === 'h') {
    highRes = !highRes
    await layoutCanvas()
  }
})

//  This preloads the images so we can get access to them
// eslint-disable-next-line no-unused-vars
const preloadImages = () => {
  //  If paper1 has loaded and we haven't draw anything yet, then kick it all off
  if (paper1Loaded !== null && !drawn) {
    clearInterval(preloadImagesTmr)
    init()
  }
}
