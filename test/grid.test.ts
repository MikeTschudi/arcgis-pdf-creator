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

import * as grid from "../src/grid";
import * as pdf from "../src/pdf";
const labelFormats = require('../data/labelFormats.json');

//--------------------------------------------------------------------------------------------------------------------//

describe("Module `grid`: grid-generating PDF routines", () => {

  describe("drawGridBoxes", () => {

    it("draws a set of boxes", () => {
      const fakeDoc = Object.assign({
        getDrawColor: () => { return "#ff0000"; },
        getLineWidth: (text: string) => { return 5; },
        rect: (originX: number, originY: number, width: number, height: number) => {},
        setDrawColor: (rgbCSS: string) => {},
        setLineWidth: (width: number) => {}
      });

      const numAcross: number = 5;
      const numDown: number = 6;
      const x0: number = 7;
      const y0: number = 8;
      const width: number = 9;
      const height: number = 10;
      const horizGap: number = 11;
      const vertGap: number = 12;
      const lineProperties: grid.ILineProperties = {};

      const rectSpy = spyOn(fakeDoc, "rect");
      const expectedNumberOfBoxes = numAcross * numDown;

      grid.drawGridBoxes(fakeDoc, numAcross, numDown, x0, y0, width, height, horizGap, vertGap, lineProperties);

      expect(rectSpy.calls.count()).withContext("rectSpy calls").toEqual(expectedNumberOfBoxes);

      for (let call = 0; call < expectedNumberOfBoxes; call++) {
        expect(rectSpy.calls.argsFor(call)[0]).withContext("x for call #" + call).toEqual(
          x0 + (call % numAcross) * (width + horizGap)
        );
        expect(rectSpy.calls.argsFor(call)[1]).withContext("y for call #" + call).toEqual(
          y0 + Math.floor(call / numAcross) * (height + vertGap)
        );
        expect(rectSpy.calls.argsFor(call)[2]).withContext("all boxes are the same width").toEqual(width);
        expect(rectSpy.calls.argsFor(call)[3]).withContext("all boxes are the same height").toEqual(height);
      }
    });

  });

  describe("drawHorizontallMeasurementTicks", () => {

    it("draws a set of tick marks", () => {
      const fakeDoc = Object.assign({
        lines: (vectors: number[][], originX: number, originY: number) => {}
      });

      // Range of ticks down the page
      const yTopTick: number = 5;
      const yBottomCutoff: number = 23;

      // Dimensions of each tick mark
      const xTickLeft: number = 55;
      const tickLength: number = 6;

      // Frequency of ticks
      const tickInterval: number = 4;

      const linesSpy = spyOn(fakeDoc, "lines");
      const expectedNumberOfTicks = 1 + Math.floor((yBottomCutoff - yTopTick) / tickInterval);

      grid.drawHorizontallMeasurementTicks(fakeDoc, yTopTick, yBottomCutoff, xTickLeft, tickLength, tickInterval);

      expect(linesSpy.calls.count()).withContext("linesSpy calls").toEqual(expectedNumberOfTicks);

      for (let call = 0; call < expectedNumberOfTicks; call++) {
        expect(linesSpy.calls.argsFor(call)[1]).withContext("all x origins are the same").toEqual(xTickLeft);
        expect(linesSpy.calls.argsFor(call)[2]).withContext("y origins vary").toEqual(yTopTick + (call * tickInterval));
        expect(linesSpy.calls.argsFor(call)[0]).withContext("all vectors are the same").toEqual([ [ tickLength, 0 ] ]);
      }
    });

  });

  describe("drawMeasurementLines", () => {

    it("draws the boundary of the page with default measurement ticks", () => {
      const fakeDoc = Object.assign({
        getDrawColor: () => { return "#ff0000"; },
        getLineWidth: (text: string) => { return 5; },
        lines: (vectors: number[][], originX: number, originY: number) => {},
        rect: (originX: number, originY: number, width: number, height: number) => {},
        setDrawColor: (rgbCSS: string) => {},
        setLineWidth: (width: number) => {}
      });

      const pageDimensions: pdf.IPageDimensions = labelFormats[0].labelSpec.pageDimensions;
      const tickLength = 0.075;
      const tickInterval =  1;
      const lineProperties: grid.IMeasurementLineProperties = {
        // tickLength,
        // tickInterval
      };

      const linesSpy = spyOn(fakeDoc, "lines");
      const rectSpy = spyOn(fakeDoc, "rect");

      const numTicksAcrossPage =
        1 + Math.floor((pageDimensions.width - pageDimensions.leftMargin - pageDimensions.rightMargin) / tickInterval);
      const numTicksDownPage =
        1 + Math.floor((pageDimensions.height - pageDimensions.topMargin - pageDimensions.bottomMargin) / tickInterval);

      const expectedNumberOfTicks =
        numTicksAcrossPage +  // top edge
        numTicksAcrossPage +  // bottom edge
        numTicksDownPage +    // left edge
        numTicksDownPage;     // right edge

      grid.drawMeasurementLines(fakeDoc, pageDimensions, lineProperties);

      expect(linesSpy.calls.count()).withContext("linesSpy calls").toEqual(expectedNumberOfTicks);

      let call = 0;
      for (; call < numTicksAcrossPage; call++) {
        expect(linesSpy.calls.argsFor(call)[0][0][0]).withContext("all vectors for top vertical ticks are the same").toEqual(0);
        expect(linesSpy.calls.argsFor(call)[0][0][1]).withContext("all vectors for top vertical ticks are the same").toBeCloseTo(tickLength);
      }
      for (; call < 2 * numTicksAcrossPage; call++) {
        expect(linesSpy.calls.argsFor(call)[0][0][0]).withContext("all vectors for bottom vertical ticks are the same").toEqual(0);
        expect(linesSpy.calls.argsFor(call)[0][0][1]).withContext("all vectors for bottom vertical ticks are the same").toBeCloseTo(-tickLength);
      }
      for (; call < 2 * numTicksAcrossPage + numTicksDownPage; call++) {
        expect(linesSpy.calls.argsFor(call)[0][0][0]).withContext("all vectors for left horizontal ticks are the same").toBeCloseTo(tickLength);
        expect(linesSpy.calls.argsFor(call)[0][0][1]).withContext("all vectors for left horizontal ticks are the same").toEqual(0);
      }
      for (; call < expectedNumberOfTicks; call++) {
        expect(linesSpy.calls.argsFor(call)[0][0][0]).withContext("all vectors for left horizontal ticks are the same").toBeCloseTo(-tickLength);
        expect(linesSpy.calls.argsFor(call)[0][0][1]).withContext("all vectors for left horizontal ticks are the same").toEqual(0);
      }

      expect(rectSpy.calls.count()).withContext("rectSpy calls").toEqual(1);
    });

    it("draws the boundary of the page with specified measurement ticks", () => {
      const fakeDoc = Object.assign({
        getDrawColor: () => { return "#ff0000"; },
        getLineWidth: (text: string) => { return 5; },
        lines: (vectors: number[][], originX: number, originY: number) => {},
        rect: (originX: number, originY: number, width: number, height: number) => {},
        setDrawColor: (rgbCSS: string) => {},
        setLineWidth: (width: number) => {}
      });

      const pageDimensions: pdf.IPageDimensions = labelFormats[0].labelSpec.pageDimensions;
      const tickLength = 1.25;
      const tickInterval =  0.5;
      const lineProperties: grid.IMeasurementLineProperties = {
        tickLength,
        tickInterval
      };

      const linesSpy = spyOn(fakeDoc, "lines");
      const rectSpy = spyOn(fakeDoc, "rect");

      const numTicksAcrossPage =
        1 + Math.floor((pageDimensions.width - pageDimensions.leftMargin - pageDimensions.rightMargin) / tickInterval);
      const numTicksDownPage =
        1 + Math.floor((pageDimensions.height - pageDimensions.topMargin - pageDimensions.bottomMargin) / tickInterval);

      const expectedNumberOfTicks =
        numTicksAcrossPage +  // top edge
        numTicksAcrossPage +  // bottom edge
        numTicksDownPage +    // left edge
        numTicksDownPage;     // right edge

      grid.drawMeasurementLines(fakeDoc, pageDimensions, lineProperties);

      expect(linesSpy.calls.count()).withContext("linesSpy calls").toEqual(expectedNumberOfTicks);

      let call = 0;
      for (; call < numTicksAcrossPage; call++) {
        expect(linesSpy.calls.argsFor(call)[0][0][0]).withContext("all vectors for top vertical ticks are the same").toEqual(0);
        expect(linesSpy.calls.argsFor(call)[0][0][1]).withContext("all vectors for top vertical ticks are the same").toBeCloseTo(tickLength);
      }
      for (; call < 2 * numTicksAcrossPage; call++) {
        expect(linesSpy.calls.argsFor(call)[0][0][0]).withContext("all vectors for bottom vertical ticks are the same").toEqual(0);
        expect(linesSpy.calls.argsFor(call)[0][0][1]).withContext("all vectors for bottom vertical ticks are the same").toBeCloseTo(-tickLength);
      }
      for (; call < 2 * numTicksAcrossPage + numTicksDownPage; call++) {
        expect(linesSpy.calls.argsFor(call)[0][0][0]).withContext("all vectors for left horizontal ticks are the same").toBeCloseTo(tickLength);
        expect(linesSpy.calls.argsFor(call)[0][0][1]).withContext("all vectors for left horizontal ticks are the same").toEqual(0);
      }
      for (; call < expectedNumberOfTicks; call++) {
        expect(linesSpy.calls.argsFor(call)[0][0][0]).withContext("all vectors for left horizontal ticks are the same").toBeCloseTo(-tickLength);
        expect(linesSpy.calls.argsFor(call)[0][0][1]).withContext("all vectors for left horizontal ticks are the same").toEqual(0);
      }

      expect(rectSpy.calls.count()).withContext("rectSpy calls").toEqual(1);
    });

  });

  describe("drawPDFLine", () => {

    it("draws a line", () => {
      const fakeDoc = Object.assign({
        lines: (vectors: number[][], originX: number, originY: number) => {}
      });

      const x0 = 5;
      const y0 = 6;
      const x1 = 50;
      const y1 = 60;

      const linesSpy = spyOn(fakeDoc, "lines");

      grid.drawPDFLine(fakeDoc, x0, y0, x1, y1);

      expect(linesSpy.calls.count()).withContext("linesSpy calls").toEqual(1);
      expect(linesSpy.calls.argsFor(0)[0]).withContext("linesSpy arg 0").toEqual([ [ x1 - x0, y1 - y0 ] ]);
      expect(linesSpy.calls.argsFor(0)[1]).withContext("linesSpy arg 1").toEqual(x0);
      expect(linesSpy.calls.argsFor(0)[2]).withContext("linesSpy arg 2").toEqual(y0);
    });

  });

  describe("drawVerticalMeasurementTicks", () => {

    it("draws a set of tick marks", () => {
      const fakeDoc = Object.assign({
        lines: (vectors: number[][], originX: number, originY: number) => {}
      });

      // Range of ticks across the page
      const xLeftTick: number = 5;
      const xRightCutoff: number = 23;

      // Dimensions of each tick mark
      const yTickTop: number = 55;
      const tickLength: number = 6;

      // Frequency of ticks
      const tickInterval: number = 4;

      const linesSpy = spyOn(fakeDoc, "lines");
      const expectedNumberOfTicks = 1 + Math.floor((xRightCutoff - xLeftTick) / tickInterval);

      grid.drawVerticalMeasurementTicks(fakeDoc, xLeftTick, xRightCutoff, yTickTop, tickLength, tickInterval);

      expect(linesSpy.calls.count()).withContext("linesSpy calls").toEqual(expectedNumberOfTicks);

      for (let call = 0; call < expectedNumberOfTicks; call++) {
        expect(linesSpy.calls.argsFor(call)[1]).withContext("x origins vary").toEqual(xLeftTick + (call * tickInterval));
        expect(linesSpy.calls.argsFor(call)[2]).withContext("all y origins are the same").toEqual(yTickTop);
        expect(linesSpy.calls.argsFor(call)[0]).withContext("all vectors are the same").toEqual([ [ 0, tickLength ] ]);
      }
    });

  });

  describe("setLineProperties", () => {

    it("does nothing if properties are not supplied", () => {
      const originalDrawColor = "#ff0000";
      const originalLineWidth = 5;
      const fakeDoc = Object.assign({
        getDrawColor: () => { return originalDrawColor; },
        getLineWidth: (text: string) => { return originalLineWidth; },
        setDrawColor: (rgbCSS: string) => {},
        setLineWidth: (width: number) => {}
      });
      const newProperties: grid.ILineProperties = {};

      const setDrawColorSpy = spyOn(fakeDoc, "setDrawColor");
      const setLineWidthSpy = spyOn(fakeDoc, "setLineWidth");

      const origProperties = grid.setLineProperties(fakeDoc, newProperties);

      expect(origProperties).withContext("expected properties").toEqual({
        color: originalDrawColor,
        width: originalLineWidth
      });
      expect(setDrawColorSpy).withContext("setDrawColor").not.toHaveBeenCalled();
      expect(setLineWidthSpy).withContext("setLineWidth").not.toHaveBeenCalled();
    });

    it("sets supplied color property", () => {
      const originalDrawColor = "#ff0000";
      const originalLineWidth = 5;
      const fakeDoc = Object.assign({
        getDrawColor: () => { return originalDrawColor; },
        getLineWidth: (text: string) => { return originalLineWidth; },
        setDrawColor: (rgbCSS: string) => {},
        setLineWidth: (width: number) => {}
      });
      const newProperties: grid.ILineProperties = {
        color: "#00ff00"
      };

      const setDrawColorSpy = spyOn(fakeDoc, "setDrawColor");
      const setLineWidthSpy = spyOn(fakeDoc, "setLineWidth");

      const origProperties = grid.setLineProperties(fakeDoc, newProperties);

      expect(origProperties).withContext("expected properties").toEqual({
        color: originalDrawColor,
        width: originalLineWidth
      });
      expect(setDrawColorSpy).withContext("setDrawColor").toHaveBeenCalled();
      expect(setLineWidthSpy).withContext("setLineWidth").not.toHaveBeenCalled();
    });

    it("sets supplied width property", () => {
      const originalDrawColor = "#ff0000";
      const originalLineWidth = 5;
      const fakeDoc = Object.assign({
        getDrawColor: () => { return originalDrawColor; },
        getLineWidth: (text: string) => { return originalLineWidth; },
        setDrawColor: (rgbCSS: string) => {},
        setLineWidth: (width: number) => {}
      });
      const newProperties: grid.ILineProperties = {
        width: 2
      };

      const setDrawColorSpy = spyOn(fakeDoc, "setDrawColor");
      const setLineWidthSpy = spyOn(fakeDoc, "setLineWidth");

      const origProperties = grid.setLineProperties(fakeDoc, newProperties);

      expect(origProperties).withContext("expected properties").toEqual({
        color: originalDrawColor,
        width: originalLineWidth
      });
      expect(setDrawColorSpy).withContext("setDrawColor").not.toHaveBeenCalled();
      expect(setLineWidthSpy).withContext("setLineWidth").toHaveBeenCalled();
    });

  });

});
