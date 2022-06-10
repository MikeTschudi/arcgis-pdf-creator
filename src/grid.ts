/** @license
 * Copyright 2022 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as jspdf from "jspdf";
import * as pdf from "./pdf";

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Properties modifying line drawing.
 */
export interface ILineProperties {
  /**
   * Color to be applied to string. Consists of a CSS-style RGB color value, e.g., "#00ffff".
   */
  color?: string;

  /**
   * Width of the line in doc units.
   */
  width?: number;
}

export interface IMeasurementLineProperties extends ILineProperties {
  /**
   * Length of each tick mark in doc units; defaults to 0.075.
   */
  tickLength?: number;

  /**
   * Gap between each tick mark in doc units; defaults to 1.
   */
  tickInterval?: number;
}

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Draws a grid of boxes with optional gaps between boxes.
 *
 * @param {object} doc jsPDF document
 * @param {number} numAcross Number of boxes in each row
 * @param {number} numDown Number of boxes in each column
 * @param {number} x0 Offset in doc units to left edge of leftmost column of boxes
 * @param {number} y0 Offset in doc units to top edge of topmost row of boxes
 * @param {number} width Width of each box in doc units
 * @param {number} height Height of each box in doc units
 * @param {number} horizGap Gap in doc units between two boxes in the same row
 * @param {number} vertGap Gap in doc units between two boxes in the same column
 * @param {object} lineProperties Drawing properties for grid lines
 */
export function drawGridBoxes(
  doc: jspdf.jsPDF,
  numAcross: number,
  numDown: number,
  x0: number,
  y0: number,
  width: number,
  height: number,
  horizGap: number,
  vertGap: number,
  lineProperties: ILineProperties
): void {
  const savedLineProperties = setLineProperties(doc, lineProperties);

  // Draw the set of boxes
  for (let i = 0; i < numAcross; ++i) {
    for (let j = 0; j < numDown; ++j) {
      doc.rect(x0 + i * (width + horizGap), y0 + j * (height + vertGap), width, height);
    }
  }

  setLineProperties(doc, savedLineProperties);
}

/**
 * Draws a set of horizontal tick marks down the page.
 *
 * @param {object} doc jsPDF document
 * @param {number} yTopTick Vertical offset in doc units to topmost tick mark
 * @param {number} yBottomCutoff Vertical offset in doc units from top of page beyond which no tick marks are to be drawn
 * @param {number} xTickLeft Horizontal offset in doc units from left of page to left of each tick mark
 * @param {number} tickLength Length of each tick mark in doc units
 * @param {number} tickInterval Gap between each tick mark in doc units
 */
export function drawHorizontallMeasurementTicks(
  doc: jspdf.jsPDF,
  yTopTick: number,
  yBottomCutoff: number,
  xTickLeft: number,
  tickLength: number,
  tickInterval: number
): void {
  for (let y = yTopTick; y <= yBottomCutoff; y += tickInterval) {
    drawPDFLine(doc, xTickLeft, y, xTickLeft + tickLength, y);
  }
}

/**
 * Draws a measurement grid useful for checking scaling and for adjusting offsets.
 *
 * @param {object} doc jsPDF document
 * @param {object} pageDimensions Rectangular box of grid
 * @param {object} lineProperties Drawing properties for grid lines
 * @note Note that grid lines will not appear if outside of printer's page print area
 */
export function drawMeasurementLines(
  doc: jspdf.jsPDF,
  pageDimensions: pdf.IPageDimensions,
  lineProperties: IMeasurementLineProperties
): void {
  const savedLineProperties = setLineProperties(doc, lineProperties);

  const tickLength = lineProperties.tickLength === undefined ? 0.075 : lineProperties.tickLength;
  const tickInterval = lineProperties.tickInterval === undefined ? 1 : lineProperties.tickInterval;

  // Draw box showing margins
  doc.rect(pageDimensions.leftMargin, pageDimensions.topMargin,
    pageDimensions.width - pageDimensions.leftMargin - pageDimensions.rightMargin,
    pageDimensions.height - pageDimensions.topMargin - pageDimensions.bottomMargin);

  // Draw tick marks along horizontal margin lines
  drawVerticalMeasurementTicks(doc,
    pageDimensions.leftMargin, // first (left) tick
    pageDimensions.width - pageDimensions.rightMargin, // tick cutoff
    pageDimensions.topMargin, tickLength, tickInterval); // tick properties
  drawVerticalMeasurementTicks(doc,
    pageDimensions.leftMargin, // first (left) tick
    pageDimensions.width - pageDimensions.rightMargin, // tick cutoff
    pageDimensions.height + pageDimensions.topMargin, -tickLength, tickInterval); // tick properties

  // Draw tick marks along vertical margin lines
  drawHorizontallMeasurementTicks(doc,
    pageDimensions.topMargin, // first (top) tick
    pageDimensions.height - pageDimensions.bottomMargin, // tick cutoff
    pageDimensions.leftMargin, tickLength, tickInterval); // tick properties
  drawHorizontallMeasurementTicks(doc,
    pageDimensions.topMargin, // first (top) tick
    pageDimensions.height - pageDimensions.bottomMargin, // tick cutoff
    pageDimensions.leftMargin + pageDimensions.width, -tickLength, tickInterval); // tick properties

  setLineProperties(doc, savedLineProperties);
}

/**
 * Draws a line.
 *
 * @param {object} doc jsPDF document
 * @param {number} x0 Horizontal offset in doc units from left of page to start of line
 * @param {number} y0 Vertical offset in doc units from top of page to start of line
 * @param {number} x1 Horizontal offset in doc units from left of page to end of line
 * @param {number} y1 Vertical offset in doc units from top of page to end of line
 */
export function drawPDFLine(
  doc: jspdf.jsPDF,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): void {
  // .lines([[dx, dy]], x0, y0)     (array of dx,dy because routine supports polylines)
  doc.lines([[x1 - x0, y1 - y0]], x0, y0);
}

/**
 * Draws a set of vertical tick marks across the page.
 *
 * @param {object} doc jsPDF document
 * @param {number} xLeftTick Horizontal offset in doc units to leftmost tick mark
 * @param {number} xRightCutoff Horizontal offset in doc units from left of page beyond which no tick marks are to be drawn
 * @param {number} yTickTop Vertical offset in doc units from top of page to top of each tick mark
 * @param {number} tickLength Length of each tick mark in doc units
 * @param {number} tickInterval Gap between each tick mark in doc units
 */
export function drawVerticalMeasurementTicks(
  doc: jspdf.jsPDF,
  xLeftTick: number,
  xRightCutoff: number,
  yTickTop: number,
  tickLength: number,
  tickInterval: number
): void {
  for (let x = xLeftTick; x <= xRightCutoff; x += tickInterval) {
    drawPDFLine(doc, x, yTickTop, x, yTickTop + tickLength);
  }
}

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Sets line drawing properties.
 *
 * @param {object} doc jsPDF document
 * @param {object} lineProperties Properties to apply
 * @returns Properties in the doc before lineProperties was applied
 * @private
 */
export function setLineProperties(
  doc: jspdf.jsPDF,
  lineProperties: ILineProperties
): ILineProperties {
  const savedLineProperties: ILineProperties = {
    color: doc.getDrawColor(),
    width: doc.getLineWidth()
  }

  if (lineProperties.color) {
    doc.setDrawColor(lineProperties.color);
  }
  if (lineProperties.width) {
    doc.setLineWidth(lineProperties.width);
  }

  return savedLineProperties;
}
