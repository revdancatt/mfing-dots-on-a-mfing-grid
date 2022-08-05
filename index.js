/* global preloadImagesTmr fxhash fxrand paper1Loaded OffscreenCanvas */

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
  type: 'speedrun %any < 720'
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

  //  Make a number of grid size, anywhere from 3 to 12
  features.grid = Math.floor(fxrand() * 9) + 3
  //  If we have the values 3 to 12, it means each one will turn up 100/9 % of the time
  //  11.1111%
  //  But sometimes, far less often we want either 1 or 2 to show up
  if (fxrand() < 0.06) { // 6%
    //  Mostly 2
    features.grid = 2
    //  Sometimes 1
    if (fxrand() < 0.2) features.grid = 1
  }
  window.$fxhashFeatures['Grid Size'] = features.grid
}

//  Call the above make features, so we'll have the window.$fxhashFeatures available
//  for fxhash
makeFeatures()
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

  /*
    Now we want to make the "dots".

    To do this we are going to create an offscreen canvas the size of a single grid tile
    and then draw to the dot to it. Then we can copy the dot over to here using a blend mode.
  */
  // Create the offscreen canvas
  const gridSize = w / features.grid
  const dotTile = new OffscreenCanvas(gridSize, gridSize)
  const dotCtx = dotTile.getContext('2d')
  //  Set the origin to the center of the tile
  dotCtx.save()
  dotCtx.translate(gridSize / 2, gridSize / 2)

  //  Draw the dot to the canvas looping over the grid
  for (let y = 0; y < features.grid; y++) {
    for (let x = 0; x < features.grid; x++) {
      //  Fill the dot tile with white
      dotCtx.fillStyle = '#FFF'
      dotCtx.fillRect(-gridSize / 2, -gridSize / 2, gridSize, gridSize)
      //  Now draw a circle in a random colour for debugging
      dotCtx.fillStyle = `hsl(${Math.floor(fxrand() * 360)}, ${fxrand() * 100}%, ${fxrand() * 100}%)`
      dotCtx.beginPath()
      dotCtx.arc(0, 0, gridSize / 2 * 0.8, 0, Math.PI * 2)
      dotCtx.fill()

      ctx.save()
      ctx.translate(w / features.grid * x, h / features.grid * y)
      ctx.globalCompositeOperation = 'multiply'
      ctx.drawImage(dotTile, 0, 0)
      ctx.restore()
    }
  }

  dotCtx.restore()
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
