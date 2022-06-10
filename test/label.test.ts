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
import * as jspdf from "jspdf";
import * as label from "../src/label";

//--------------------------------------------------------------------------------------------------------------------//

describe("Module `label`: label-generating PDF routines", () => {

  describe("clipOverlongLines", () => {

    it("handles empty line list", () => {
      const fakeDoc = Object.assign({});
      const textLines = [] as string[];
      const maxTextWidth = 5;

      const actual = label.clipOverlongLines(fakeDoc, textLines, maxTextWidth);

      expect(actual).toEqual([] as string[]);
    });

    it("handles line list that fits", () => {
      const fakeDoc = Object.assign({
        getStringUnitWidth: (text: string) => { return text.length; },
        getFontSize: () => { return 1; },
        internal: {
          scaleFactor: 1
        }
      });
      const textLines = [
        "abc",
        "def",
        "ghi"
      ] as string[];
      const maxTextWidth = 5;

      const actual = label.clipOverlongLines(fakeDoc, textLines, maxTextWidth);

      expect(actual).toEqual([
        "abc",
        "def",
        "ghi"
      ] as string[]);
    });

    it("handles list lines that are too wide", () => {
      const fakeDoc = Object.assign({
        getStringUnitWidth: (text: string) => { return text.length; },
        getFontSize: () => { return 1; },
        internal: {
          scaleFactor: 1
        }
      });
      const textLines = [
        "abc",
        "defghijkl",
        "mno"
      ] as string[];
      const maxTextWidth = 5;

      const actual = label.clipOverlongLines(fakeDoc, textLines, maxTextWidth);

      expect(actual).toEqual([
        "abc",
        "defgh...",
        "mno"
      ] as string[]);
    });

  });

  describe("getLabelFormat", () => {

    it("returns null if the doc does not have any label formats", () => {
      const doc = {
      } as label.IjsPDFExt;

      const actual = label.getLabelFormat(doc, "xx");

      expect(actual).toBeNull();
    });

    it("returns null if the doc does not have the specified label format", () => {
      const doc = {
        labelFormats: gLabelFormats
      } as label.IjsPDFExt;

      const actual = label.getLabelFormat(doc, "X");

      expect(actual).toBeNull();
    });

    it("returns a  specified label format", () => {
      const doc = {
        labelFormats: gLabelFormats
      } as label.IjsPDFExt;

      const actual = label.getLabelFormat(doc, "C");

      expect(actual).toEqual(gLabelFormats[2]);
    });

  });

  describe("drawLabelGuidelines", () => {

    it("doesn't draw lines if no specs supplied", () => {
      const doc = {
      } as jspdf.jsPDF;
      const labelSpec = gLabelFormats[0].labelSpec;

      const drawGridBoxesSpy = spyOn(grid, "drawGridBoxes");
      const drawMeasurementLinesSpy = spyOn(grid, "drawMeasurementLines");

      label.drawLabelGuidelines(doc, labelSpec);

      expect(drawGridBoxesSpy.calls.count()).toEqual(0);
      expect(drawMeasurementLinesSpy.calls.count()).toEqual(0);
    });

    it("draw specified lines", () => {
      const doc = {
      } as jspdf.jsPDF;
      const labelSpec = gLabelFormats[0].labelSpec;
      const labelBoundaryLinesProperties = {
        color: "#00ffff",
        width: 1.2
      } as grid.ILineProperties;
      const measurementLinesProperties = {
        tickLength: 1.3,
        tickInterval: 1.4
      } as grid.IMeasurementLineProperties;

      const drawGridBoxesSpy = spyOn(grid, "drawGridBoxes");
      const drawMeasurementLinesSpy = spyOn(grid, "drawMeasurementLines");

      label.drawLabelGuidelines(doc, labelSpec,
        labelBoundaryLinesProperties, measurementLinesProperties);

      expect(drawGridBoxesSpy.calls.count()).toEqual(1);
      expect(drawMeasurementLinesSpy.calls.count()).toEqual(1);
    });

  });

  describe("getTextWidth", () => {

    it("handles uninitialized doc", () => {
      const doc = {
      } as label.IjsPDFExt;

      const actual = label.getAvailableLabelFormats(doc);

      expect(actual).toEqual([] as label.ILabelDescription[]);
    });

    it("handles initialized doc without label formats", () => {
      const doc = {
        labelFormats: [] as label.ILabel[]
      } as label.IjsPDFExt;

      const actual = label.getAvailableLabelFormats(doc);

      expect(actual).toEqual([] as label.ILabelDescription[]);
    });

    it("handles initialized doc with label formats", () => {
      const doc = {
        labelFormats: gLabelFormats
      } as label.IjsPDFExt;

      const expected: label.ILabelDescription[] = gLabelFormats.map((lf) => lf.descriptionPDF);

      const actual = label.getAvailableLabelFormats(doc);

      expect(actual).toEqual(expected);
    });

  });

  describe("getTextWidth", () => {

    it("calcuates successfully", () => {
      const fakeDoc = Object.assign({
        getFontSize: () => {},
        getStringUnitWidth: (text: string) => {},
        internal: {
          scaleFactor: 5
        }
      });
      const getFontSizeSpy = spyOn(fakeDoc, "getFontSize").and.returnValue(15);
      expect(fakeDoc.getFontSize()).toEqual(15);
      const getStringUnitWidthSpy = spyOn(fakeDoc, "getStringUnitWidth").and.returnValue(250);
      expect(fakeDoc.getStringUnitWidth("text")).toEqual(250);
      expect(fakeDoc.internal.scaleFactor).toEqual(5);

      const actual = label.getTextWidth(fakeDoc, "text");

      expect(actual).toEqual(750);
    });

  });

  describe("initPDFLabelDoc", () => {

    it("handles normal init", done => {
      const fakeDoc = Object.assign({
        existsFileInVFS: (filename: string) => {},
        setFont: (fontName: string, fontStyle: string, fontWeight: string) => {},
        setLanguage: (langCode: string) => {},
        setR2L: (value: boolean) => {}
      });
      spyOn(fakeDoc, "existsFileInVFS").and.returnValue(true);
      spyOn(fakeDoc, "setFont");
      spyOn(fakeDoc, "setLanguage");

      const labelFormatsJson = JSON.stringify(gLabelFormats);
      spyOn(window, "fetch").and.returnValue(Promise.resolve(new Response(labelFormatsJson)));

      label.initPDFLabelDoc(fakeDoc, "")
      .then(
        (response) => {
          expect(response.labelFormats).toBeDefined();
          expect(JSON.stringify(response.labelFormats)).toEqual(labelFormatsJson);
          done();
        },
        () => {
          done.fail();
        }
      );
    });

    it("flags existence of unexpected jsPDF property", done => {
      const fakeDoc = Object.assign({
        existsFileInVFS: (filename: string) => {},
        setFont: (fontName: string, fontStyle: string, fontWeight: string) => {},
        setLanguage: (langCode: string) => {},
        setR2L: (value: boolean) => {},
        labelFormats: {}
      });
      spyOn(fakeDoc, "existsFileInVFS").and.returnValue(true);
      spyOn(fakeDoc, "setFont");
      const setLanguage = spyOn(fakeDoc, "setLanguage");

      const labelFormatsJson = JSON.stringify(gLabelFormats);
      spyOn(window, "fetch").and.returnValue(Promise.resolve(new Response(labelFormatsJson)));

      label.initPDFLabelDoc(fakeDoc, "")
      .then(
        () => done.fail(),
        (error) => {
          expect(setLanguage.calls.argsFor(0)[0]).withContext("check setLanguage's langCode arg").toEqual("en-US");
          expect(error.message).toEqual("startPDFLabelDoc is stomping on labelFormats property");
          done();
        }
      );
    });

  });

  describe("loadLabelFormats", () => {

    it("loads and parses the label formats file", done => {
      const labelFormatsJson = JSON.stringify(gLabelFormats);
      spyOn(window, "fetch").and.returnValue(Promise.resolve(new Response(labelFormatsJson)));

      label.loadLabelFormats("")
      .then(
        (response) => {
          expect(JSON.stringify(response)).toEqual(labelFormatsJson);
          done();
        },
        () => {
          done.fail();
        }
      );
    });

  });

});

//--------------------------------------------------------------------------------------------------------------------//

const gLabelFormats = [{
  descriptionPDF: {
    labelWidthDisplay: "1",
    labelHeightDisplay: "2",
    labelsPerPageDisplay: "3",
    averyPartNumber: "A"
  },
  labelSpec: {
    type: "1",
    pageDimensions: {
      width: 1,
      height: 1,
      leftMargin: 1,
      rightMargin: 1,
      topMargin: 1,
      bottomMargin: 1
    },
    numLabelsAcross: 1,
    numLabelsDown: 1,
    labelWidth: 1,
    labelHeight: 1,
    horizGapIn: 1,
    vertGapIn: 1,
    labelPadding: 1,
    fontSizePx: 1,
    maxNumLabelLines: 1
  }
}, {
  descriptionPDF: {
    labelWidthDisplay: "10",
    labelHeightDisplay: "20",
    labelsPerPageDisplay: "30",
    averyPartNumber: "B"
  },
  labelSpec: {
    type: "10",
    pageDimensions: {
      width: 10,
      height: 10,
      leftMargin: 10,
      rightMargin: 10,
      topMargin: 10,
      bottomMargin: 10
    },
    numLabelsAcross: 10,
    numLabelsDown: 10,
    labelWidth: 10,
    labelHeight: 10,
    horizGapIn: 10,
    vertGapIn: 10,
    labelPadding: 10,
    fontSizePx: 10,
    maxNumLabelLines: 10
  }
}, {
  descriptionPDF: {
    labelWidthDisplay: "100",
    labelHeightDisplay: "200",
    labelsPerPageDisplay: "300",
    averyPartNumber: "C"
  },
  labelSpec: {
    type: "100",
    pageDimensions: {
      width: 100,
      height: 100,
      leftMargin: 100,
      rightMargin: 100,
      topMargin: 100,
      bottomMargin: 100
    },
    numLabelsAcross: 100,
    numLabelsDown: 100,
    labelWidth: 100,
    labelHeight: 100,
    horizGapIn: 100,
    vertGapIn: 100,
    labelPadding: 100,
    fontSizePx: 100,
    maxNumLabelLines: 100
  }
}] as label.ILabel[];
