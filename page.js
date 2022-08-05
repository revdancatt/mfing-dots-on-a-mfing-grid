/* global Line noise */
// eslint-disable-next-line no-unused-vars

/**
 * ===============================================================================================
 * ===============================================================================================
 * ===============================================================================================
 *
 * NOTE TO THE READER (that's you)
 *
 * This is my own messy code to make SVG files for sending to the AxiDraw without having
 * to deal with Illustrator.
 *
 * This is NOT good code, this is not the "proper" way to write helpful libraries like this
 * but it does what I need it to do in a way that helps me debug easily in the console
 * etc. etc. etc. The "cull/bisectLines" functions are particularly terrible.
 *
 * There is no versioning, no changelogs, no githib repo, the latest version probable lives here.
 *
 * ===============================================================================================
 * ===============================================================================================
 * ===============================================================================================
 */

/**
 * The page object (which you'd expect to be a class but isn't for various dull reasons)
 * controls the display of lines on a canvas, the saving of those lines into svgs
 * and other various bits and bobs
 *
 * Page
 * @namespace
 * @property {function} translate
 * @property {function} rotate
 * @property {function} displace
 * @property {function} scale
 * @property {function} getBoundingBox
 * @property {function} makeCircle
 */
const page = {

  /**
   * A utility method to translate a single line or an array of lines
   * by the passed values. It always returns an array of lines
   * @param {(Array|object)}  lines An array of {@link Line} objects, or a single {@link Line} object
   * @param {number}          x     The x offset
   * @param {number}          y     The y offset
   * @param {number}          z     The z offset
   * @returns {Array}               An array of {@link Line} objects
   */
  translate: (lines, x, y, z = 0) => {
    const newLines = []
    if (!Array.isArray(lines)) lines = [lines]
    lines.forEach((line) => {
      const newLine = new Line(line.getZindex())
      const points = line.getPoints()
      points.forEach((point) => {
        newLine.addPoint(point.x + x, point.y + y, point.z + z)
      })
      newLines.push(newLine)
    })
    return newLines
  },

  /**
   * A utility method to translate a single line or an array of lines
   * by the passed values. It always returns an array of lines
   * @param {(Array|object)}  lines             An array of {@link Line} objects, or a single {@link Line} object
   * @param {number}          angle             The angle in degrees to rotate around
   * @param {boolean}         aroundOwnMidpoint Rotate around it's own middle if true, around 0,0 origin if false
   * @returns {Array}                 An array of {@link Line} objects
   */
  rotate: (lines, angle, aroundOwnMidpoint = true) => {
    //  Convert the angle from degree to radians
    const adjustedAngle = (-angle * Math.PI / 180)

    //  This will hold our final lines for us
    let newLines = []
    //  Make sure the lines are an array
    if (!Array.isArray(lines)) lines = [lines]
    //  Grab the bouding box in case we need it
    const bb = page.getBoundingBox(lines)

    //  If we are rotating around it's own center then translate it to 0,0
    if (aroundOwnMidpoint) {
      lines = page.translate(lines, -bb.mid.x, -bb.mid.y)
    }

    //  Now rotate all the points
    lines.forEach((line) => {
      const newLine = new Line(line.getZindex())
      const points = line.getPoints()
      points.forEach((point) => {
        newLine.addPoint((Math.cos(adjustedAngle) * point.x) + (Math.sin(adjustedAngle) * point.y), (Math.cos(adjustedAngle) * point.y) - (Math.sin(adjustedAngle) * point.x), point.z)
      })
      newLines.push(newLine)
    })

    //  If we are rotating around the center now we need to move it back
    //  to it's original position
    if (aroundOwnMidpoint) {
      newLines = page.translate(newLines, bb.mid.x, bb.mid.y)
    }
    //  Send the lines back
    return newLines
  },

  /**
   * A utility method to translate a single line or an array of lines
   * by the passed values. It always returns an array of lines
   * @param {(Array|object)}  lines             An array of {@link Line} objects, or a single {@link Line} object
   * @param {displacement}    vectorObjects     The angle in degrees to rotate around
   * @returns {Array}                           An array of {@link Line} objects
   */
  displace: (lines, displacement) => {
    //  This will hold our final lines for us
    const newLines = []
    //  Make sure the lines are an array
    if (!Array.isArray(lines)) lines = [lines]

    //  If we are supposed to do time, then do it
    const midPoint = {
      x: page.size[0] / 2,
      y: page.size[1] / 2
    }
    const d = new Date().getTime()
    const cornerDistance = (midPoint.x * midPoint.x) + (midPoint.y * midPoint.y)

    //  Now displace all the points
    lines.forEach((line) => {
      const newLine = new Line(line.getZindex())
      const points = line.getPoints()
      points.forEach((point) => {
        const newPoint = {
          x: point.x,
          y: point.y,
          z: point.z
        }

        //  Do the hoop jumping to
        const weightPoint = {
          x: point.x + page.size[0] / 2 + displacement.xShift,
          y: point.y + page.size[1] / 2 + displacement.yShift,
          z: point.z
        }

        let finalWeightingMod = 1
        if (displacement.direction === 'topDown') finalWeightingMod = (1 - weightPoint.y / page.size[1]) * 1
        if (displacement.direction === 'leftRight') finalWeightingMod = (1 - weightPoint.x / page.size[0]) * 1
        if (displacement.direction === 'middle') {
          const thisDist = ((midPoint.x - weightPoint.x) * (midPoint.x - weightPoint.x)) + ((midPoint.y - weightPoint.y) * (midPoint.y - weightPoint.y))
          finalWeightingMod = (0.71 - (thisDist / cornerDistance - (displacement.middleDist / 1000)) * 1)
        }
        if (displacement.direction === 'noise') {
          finalWeightingMod = ((noise.perlin3(weightPoint.x / 20 + (d / 721), weightPoint.y / 20 + (d / 883), d / 1000) + 1) / 2)
        }
        if (displacement.weighting !== 0) finalWeightingMod *= displacement.weighting
        if (displacement.invert) finalWeightingMod = 1 - finalWeightingMod

        newPoint.x += noise.perlin3((point.x + displacement.xNudge) / displacement.resolution, (point.y + displacement.xNudge) / displacement.resolution, (point.z + displacement.xNudge) / displacement.resolution) * displacement.xScale * displacement.amplitude * finalWeightingMod
        newPoint.y += noise.perlin3((point.x + displacement.yNudge) / displacement.resolution, (point.y + displacement.yNudge) / displacement.resolution, (point.z + displacement.yNudge) / displacement.resolution) * displacement.yScale * displacement.amplitude * finalWeightingMod
        newPoint.z += noise.perlin3((point.x + displacement.zNudge) / displacement.resolution, (point.y + displacement.zNudge) / displacement.resolution, (point.z + displacement.zNudge) / displacement.resolution) * displacement.zScale * displacement.amplitude * finalWeightingMod
        newLine.addPoint(newPoint.x, newPoint.y, newPoint.z)
        // newLine.addPoint((Math.cos(adjustedAngle) * point.x) + (Math.sin(adjustedAngle) * point.y), (Math.cos(adjustedAngle) * point.y) - (Math.sin(adjustedAngle) * point.x))
      })
      newLines.push(newLine)
    })

    //  Send the lines back
    return newLines
  },

  /**
   * A utility method to scale a single line or an array of lines
   * by the passed values. It always returns an array of lines
   * @param {(Array|object)}  lines             An array of {@link Line} objects, or a single {@link Line} object
   * @param {number}          xScale            The amount to scale in the x direction
   * @param {number}          yScale            The amount to scale in the y direction, if null, then uses the same value as xScale
   * @param {number}          zScale            The amount to scale in the z direction, if null, then uses the same value as xScale
   * @param {boolean}         aroundOwnMidpoint Scale around it's own middle if true, around 0,0 origin if false
   * @returns {Array}                           An array of {@link Line} objects
   */
  scale: (lines, xScale, yScale = null, zScale = null, aroundOwnMidpoint = true) => {
    //  This will hold our final lines for us
    let newLines = []
    //  Make sure the lines are an array
    if (!Array.isArray(lines)) lines = [lines]
    //  Grab the bouding box in case we need it
    const bb = page.getBoundingBox(lines)

    //  If we are rotating around it's own center then translate it to 0,0
    if (aroundOwnMidpoint) {
      lines = page.translate(lines, -bb.mid.x, -bb.mid.y)
    }

    if (yScale === null) yScale = xScale
    if (zScale === null) zScale = xScale

    //  Now scale all the points
    lines.forEach((line) => {
      const newLine = new Line(line.getZindex())
      const points = line.getPoints()
      points.forEach((point) => {
        newLine.addPoint(xScale * point.x, yScale * point.y, zScale * point.z)
      })
      newLines.push(newLine)
    })

    //  If we are scaling around the center now we need to move it back
    //  to it's original position
    if (aroundOwnMidpoint) {
      newLines = page.translate(newLines, bb.mid.x, bb.mid.y, bb.mid.z)
    }
    //  Send the lines back
    return newLines
  },

  /**
   * This utility method gets the bounding box from an array of lines, it also
   * calculates the midpoint
   * @param {(Array|object)}  lines  An array of {@link Line} objects, or a single {@link Line} object
   * @returns {object}        And object containing the min/max points and the mid points
   */
  getBoundingBox: (lines) => {
    if (!Array.isArray(lines)) lines = [lines]

    const max = {
      x: -999999999,
      y: -999999999,
      z: -999999999
    }
    const min = {
      x: 999999999,
      y: 999999999,
      z: 999999999
    }
    lines.forEach((line) => {
      const points = line.getPoints()
      points.forEach((point) => {
        if (point.x < min.x) min.x = point.x
        if (point.x > max.x) max.x = point.x
        if (point.y < min.y) min.y = point.y
        if (point.y > max.y) max.y = point.y
        if (point.z < min.z) min.z = point.z
        if (point.z > max.z) max.z = point.z
      })
    })
    return {
      min,
      max,
      mid: {
        x: min.x + ((max.x - min.x) / 2),
        y: min.y + ((max.y - min.y) / 2),
        z: min.z + ((max.z - min.z) / 2)
      }
    }
  },

  /**
   * A utility method that will return a circle, well, technically a
   * polygon based on the number of segments and radius. The zIndex is
   * also set here. The polygon returned is centered on 0,0.
   * @param   {number}  segments  The number of segments in the circle
   * @param   {number}  radius    The radius of the polygon
   * @param   {number}  zIndex    The zIndex to be applied to the returned {@link Line}
   * @returns {Array}             Returns an Array containing a single {@link Line} object
   */
  makeCircle: (segments, radius, zIndex) => {
    const circle = new Line(zIndex)
    const angle = 360 / segments
    for (let s = 0; s <= segments; s++) {
      const adjustedAngle = ((angle * s) * Math.PI / 180)
      const x = Math.cos(adjustedAngle) * radius
      const y = Math.sin(adjustedAngle) * radius
      circle.addPoint(x, y)
    }
    return [circle]
  }
}
