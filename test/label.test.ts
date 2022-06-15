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
const labelFormats = require('../data/labelFormats.json');

//--------------------------------------------------------------------------------------------------------------------//

describe("Module `label`: label-generating PDF routines", () => {

  describe("addLabelsToDoc", () => {

    it("doesn't draw if no labels are supplied", done => {
      const fakeDoc = Object.assign({
        addPage: (format: string, orientation: string) => {},
        getFontSize: () => { return 1; },
        getStringUnitWidth: (text: string) => { return text.length; },
        setFontSize: (size: number) => {},
        text: (text: string[], x: number, y: number) => {},
        internal: { scaleFactor: 72 }
      });
      const labels = [];
      const labelSpec = labelFormats[0].labelSpec;  // 30 labels per page
      const startingPageNum = 1;

      const addPageSpy = spyOn(fakeDoc, "addPage");
      const setFontSizeSpy = spyOn(fakeDoc, "setFontSize");
      const textSpy = spyOn(fakeDoc, "text");

      label.addLabelsToDoc(fakeDoc, labels, labelSpec, startingPageNum)
      .then(
        (currentPageNum: number) => {
          expect(currentPageNum).withContext("currentPageNum").toEqual(startingPageNum);
          expect(addPageSpy.calls.count()).withContext("addPage calls").toEqual(0);
          expect(setFontSizeSpy.calls.count()).withContext("setFontSize calls").toEqual(1);
          expect(textSpy.calls.count()).withContext("text calls").toEqual(0);
          done();
        },
        () => {
          done.fail();
        }
      );
    });

    it("generates labels and reports progress", done => {
      const fakeDoc = Object.assign({
        addPage: (format: string, orientation: string) => {},
        getFontSize: () => { return 1; },
        getStringUnitWidth: (text: string) => { return text.length; },
        setFontSize: (size: number) => {},
        text: (text: string[], x: number, y: number) => {},
        internal: { scaleFactor: 72 }
      });
      const labels = [[
        "abc",
        "def"
        ], [
        "ghi",
        "jkl"
        ], [
        "mno",
        "pqr"
      ]];
      const labelSpec = labelFormats[0].labelSpec;  // 30 labels per page
      const startingPageNum = 4;

      const addPageSpy = spyOn(fakeDoc, "addPage");
      const setFontSizeSpy = spyOn(fakeDoc, "setFontSize");
      const textSpy = spyOn(fakeDoc, "text");

      const reportedPcts: number[] = [];
      const recordPcts = (pct) => { reportedPcts.push(pct); };
      const expectedPcts = [0, 33, 67, 100];

      label.addLabelsToDoc(fakeDoc, labels, labelSpec, startingPageNum, undefined, recordPcts)
      .then(
        (currentPageNum: number) => {
        expect(currentPageNum).withContext("currentPageNum").toEqual(startingPageNum);
          expect(addPageSpy.calls.count()).withContext("addPage calls").toEqual(0);
          expect(setFontSizeSpy.calls.count()).withContext("setFontSize calls").toEqual(1);
          expect(textSpy.calls.count()).withContext("text calls").toEqual(3);
          expect(reportedPcts).withContext("reported pcts").toEqual(expectedPcts);

          for (let row: number = 0; row < labels.length; ++row) {
            const { labelTextLeft, labelFirstLineBase } =
              calculateLabelPosition(fakeDoc.internal.scaleFactor, labelSpec, row, 0, labels[row].length);
            expect(textSpy.calls.argsFor(row)[1]).withContext("label " + row + " left").toEqual(labelTextLeft);
            expect(textSpy.calls.argsFor(row)[2]).withContext("label " + row + " first line base").toEqual(labelFirstLineBase);
          }

          done();
        },
        () => {
          done.fail();
        }
      );
    });

    it("generates labels, skipping empty ones", done => {
      const fakeDoc = Object.assign({
        addPage: (format: string, orientation: string) => {},
        getFontSize: () => { return 1; },
        getStringUnitWidth: (text: string) => { return text.length; },
        setFontSize: (size: number) => {},
        text: (text: string[], x: number, y: number) => {},
        internal: { scaleFactor: 72 }
      });
      const labels = [[
        "abc",
        "def"
        ], [
        ], [
        "mno",
        "pqr"
      ]];
      const labelSpec = labelFormats[0].labelSpec;  // 30 labels per page
      const startingPageNum = 4;

      const addPageSpy = spyOn(fakeDoc, "addPage");
      const setFontSizeSpy = spyOn(fakeDoc, "setFontSize");
      const textSpy = spyOn(fakeDoc, "text");

      const reportedPcts: number[] = [];
      const recordPcts = (pct) => { reportedPcts.push(pct); };
      const expectedPcts = [0, 50, 100];

      label.addLabelsToDoc(fakeDoc, labels, labelSpec, startingPageNum, undefined, recordPcts)
      .then(
        (currentPageNum: number) => {
        expect(currentPageNum).withContext("currentPageNum").toEqual(startingPageNum);
          expect(addPageSpy.calls.count()).withContext("addPage calls").toEqual(0);
          expect(setFontSizeSpy.calls.count()).withContext("setFontSize calls").toEqual(1);
          expect(textSpy.calls.count()).withContext("text calls").toEqual(2);
          expect(reportedPcts).withContext("reported pcts").toEqual(expectedPcts);

          {
            let { labelTextLeft, labelFirstLineBase } =
              calculateLabelPosition(fakeDoc.internal.scaleFactor, labelSpec, 0, 0, labels[0].length);
            expect(textSpy.calls.argsFor(0)[1]).withContext("label 0 left").toEqual(labelTextLeft);
            expect(textSpy.calls.argsFor(0)[2]).withContext("label 0 first line base").toEqual(labelFirstLineBase);
          }
          {
            let { labelTextLeft, labelFirstLineBase } =
              calculateLabelPosition(fakeDoc.internal.scaleFactor, labelSpec, 1, 0, labels[2].length);
            expect(textSpy.calls.argsFor(1)[1]).withContext("label 2 left").toEqual(labelTextLeft);
            expect(textSpy.calls.argsFor(1)[2]).withContext("label 2 first line base").toEqual(labelFirstLineBase);
          }

          done();
        },
        () => {
          done.fail();
        }
      );
    });

    it("generates multiple columns and pages of labels as needed", done => {
      const fakeDoc = Object.assign({
        addPage: (format: string, orientation: string) => {},
        getFontSize: () => { return 1; },
        getStringUnitWidth: (text: string) => { return text.length; },
        setFontSize: (size: number) => {},
        text: (text: string[], x: number, y: number) => {},
        internal: { scaleFactor: 72 }
      });
      const labels = [[
        "abc",
        "def"
        ], [
        "ghi",
        "jkl"
        ], [
        "mno",
        "pqr"
        ], [
        "stu",
        "vwx"
        ], [
        "yz0",
        "123"
        ], [
        "456",
        "789"
        ], [
        "a1a",
        "b2b"
      ]];
      const labelSpec = labelFormats[4].labelSpec;  // 6 labels per page
      const startingPageNum = 2;

      const addPageSpy = spyOn(fakeDoc, "addPage");
      const setFontSizeSpy = spyOn(fakeDoc, "setFontSize");
      const textSpy = spyOn(fakeDoc, "text");

      label.addLabelsToDoc(fakeDoc, labels, labelSpec, startingPageNum)
      .then(
        (currentPageNum: number) => {
        expect(currentPageNum).withContext("currentPageNum").toEqual(startingPageNum + 1);
          expect(addPageSpy.calls.count()).withContext("addPage calls").toEqual(1);
          expect(setFontSizeSpy.calls.count()).withContext("setFontSize calls").toEqual(1);
          expect(textSpy.calls.count()).withContext("text calls").toEqual(7);

          for (let labelNum: number = 0; labelNum < labels.length; ++labelNum) {
            const row = labelNum % labelSpec.numLabelsDown;
            const col = Math.floor(labelNum / labelSpec.numLabelsDown) % labelSpec.numLabelsAcross;
            const { labelTextLeft, labelFirstLineBase } =
              calculateLabelPosition(fakeDoc.internal.scaleFactor, labelSpec, row, col, labels[labelNum].length);
            expect(textSpy.calls.argsFor(labelNum)[1]).withContext("label " + row + "," + col + " left").toEqual(labelTextLeft);
            expect(textSpy.calls.argsFor(labelNum)[2]).withContext("label " + row + "," + col + " first line base").toEqual(labelFirstLineBase);
          }

          done();
        },
        () => {
          done.fail();
        }
      );
    });

  });

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
        getFontSize: () => { return 1; },
        getStringUnitWidth: (text: string) => { return text.length; },
        internal: { scaleFactor: 72 }
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
        getFontSize: () => { return 1; },
        getStringUnitWidth: (text: string) => { return text.length; },
        internal: { scaleFactor: 1 }
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
        labelFormats
      } as label.IjsPDFExt;

      const actual = label.getLabelFormat(doc, "X");

      expect(actual).toBeNull();
    });

    it("returns a  specified label format", () => {
      const doc = {
        labelFormats
      } as label.IjsPDFExt;

      const actual = label.getLabelFormat(doc, "*62");

      expect(actual).toEqual(labelFormats[2]);
    });

  });

  describe("drawLabelGuidelines", () => {

    it("doesn't draw lines if no specs supplied", () => {
      const doc = {
      } as jspdf.jsPDF;
      const labelSpec = labelFormats[0].labelSpec;

      const drawGridBoxesSpy = spyOn(grid, "drawGridBoxes");
      const drawMeasurementLinesSpy = spyOn(grid, "drawMeasurementLines");

      label.drawLabelGuidelines(doc, labelSpec);

      expect(drawGridBoxesSpy.calls.count()).toEqual(0);
      expect(drawMeasurementLinesSpy.calls.count()).toEqual(0);
    });

    it("draw specified lines", () => {
      const doc = {
      } as jspdf.jsPDF;
      const labelSpec = labelFormats[0].labelSpec;
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
        labelFormats
      } as label.IjsPDFExt;

      const expected: label.ILabelDescription[] = labelFormats.map((lf) => lf.descriptionPDF);

      const actual = label.getAvailableLabelFormats(doc);

      expect(actual).toEqual(expected);
    });

  });

  describe("getTextWidth", () => {

    it("calcuates successfully", () => {
      const fakeDoc = Object.assign({
        getFontSize: () => {},
        getStringUnitWidth: (text: string) => {},
        internal: { scaleFactor: 5 }
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

      const labelFormatsJson = JSON.stringify(labelFormats);
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

      const labelFormatsJson = JSON.stringify(labelFormats);
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
      const labelFormatsJson = JSON.stringify(labelFormats);
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

interface ILabelPos {
  labelTextLeft: number,
  labelFirstLineBase: number
}

function calculateLabelPosition(
  scaleFactor: number,
  labelSpec: label.ILabelSpec,
  row: number,
  col: number,
  numLinesInLabel: number
): ILabelPos {
  const fontHeight = labelSpec.fontSizePx / scaleFactor;
  const verticalFontGap = 0.20 * fontHeight;

  const labelTextLeft =
    labelSpec.pageDimensions.leftMargin +
    (col * (labelSpec.labelWidth + labelSpec.horizGapIn)) +
    labelSpec.labelPadding;

  const labelFirstLineBase =
    label.calculateLabelFirstLineBase(
      label.calculateLabelTop(
        labelSpec.pageDimensions.topMargin,
        row,
        labelSpec.labelHeight,
        labelSpec.vertGapIn
      ),
      labelSpec.labelHeight,
      numLinesInLabel,
      fontHeight,
      verticalFontGap
    );

  return { labelTextLeft, labelFirstLineBase };
}
