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

import * as grid from "./grid";
import * as jspdf from "jspdf";
import * as pdf from "./pdf";

//--------------------------------------------------------------------------------------------------------------------//

/**
 * An extension of the jspdf.jsPDF doc object to store label information.
 */
export interface IjsPDFExt extends jspdf.jsPDF {
  /**
   * Properties of a page of labels.
   */
  labelFormats?: ILabel[];
}

/**
 * Properties of a page of labels.
 */
export interface ILabel {
  /**
   * User-interface description of label type.
   */
  descriptionPDF: ILabelDescription;

  /**
   * Properties describing page dimensions of labels sheet.
   */
  labelSpec: ILabelSpec;
}

/**
 * User-interface description of label type.
 */
export interface ILabelDescription {
  /**
   * Width of label for display, e.g., "2-5/8"
   */
  labelWidthDisplay: string;

  /**
   * Height of label for display, e.g., "1"
   */
  labelHeightDisplay: string;

  /**
   * Number of labels on page, e.g., "30"
   */
  labelsPerPageDisplay: string;

  /**
   * Avery® part number, e.g., "*60"
   */
  averyPartNumber: string;
}

/**
 * Properties describing page dimensions of labels sheet.
 */
export interface ILabelSpec {
  /**
   * Flag indicating the nature of the label product, e.g., "AVERY", "CSV"
   */
  type: string;

  /**
   * Properties describing page dimensions in doc units.
   */
  pageDimensions: pdf.IPageDimensions;

  /**
   * Count of labels across the width of the page
   */
  numLabelsAcross: number;

  /**
   * Count of labels down the length of the page
   */
  numLabelsDown: number;

  /**
   * Width of a label in doc units
   */
  labelWidth: number;

  /**
   * Height of a label in doc units
   */
  labelHeight: number;

  /**
   * Gap between each column of labels in doc units
   */
  horizGapIn: number;

  /**
   * Gap between each row of labels in doc units
   */
  vertGapIn: number;

  /**
   * Amount of padding within labels in doc units
   */
  labelPadding: number;

  /**
   * Font size for text put in each label in pixels
   */
  fontSizePx: number;

  /**
   * Maximum number of lines that a label is permitted to hold; subsequent lines will not be written
   */
  maxNumLabelLines: number;
}

/**
 * Function signature for reporting progress in function addLabelsToDoc.
 *
 */
export type IAddLabelsToDocProgressCallback = (
  /**
   * Percent done; range 0..100
   */
  percentDone: number
) => void;

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Add labels to a PDF doc, starting at the beginning of the current PDF doc page.
 *
 * @param {object} doc jsPDF document
 * @param labels Array of labels; each label consists of one or more line strings
 * @param labelSpec Properties describing page dimensions of labels sheet
 * @param startingPageNum The 1-based page number to start printing labels into; page is assumed to be blank & to exist
 * @param subsequentPageOptions Options for creating pages after startingPageNum (if needed) such as
 * page size, orientation; defaults to "letter", "portrait"
 * @param progressCallback Callback with percent done in range 0..100
 * @returns Promise which, when resolved, returns the 1-based page number of the last page containing labels
 */
export function addLabelsToDoc(
  doc: jspdf.jsPDF,
  labels: string[][],
  labelSpec: ILabelSpec,
  startingPageNum: number,
  subsequentPageOptions = {} as pdf.IPDFOptions,
  progressCallback?: IAddLabelsToDocProgressCallback
): Promise<number> {
  return new Promise<number>((resolve) => {
    const labelsPerPageDisplay = labelSpec.numLabelsAcross * labelSpec.numLabelsDown;
    let column;
    let row;
    let currentLabelLeft;
    let currentLabelTop;
    const maxLabelTextWidth = labelSpec.labelWidth - (2 * labelSpec.labelPadding);

    // Prep the drawing environment
    // Compute the font height in page units of the font and jsPDF's text line gap height
    const fontHeight = labelSpec.fontSizePx / doc.internal.scaleFactor;
    const verticalFontGap = 0.20 * fontHeight;
    doc.setFontSize(labelSpec.fontSizePx);

    // Screen out empty labels
    const screenedLabels = labels.filter(
      (label) => Array.isArray(label) && label.length > 0
    );

    // Draw
    let currentPageNum = startingPageNum;

    for (let iLabel = 0; iLabel < screenedLabels.length; iLabel++) {
      if (progressCallback) {
        progressCallback(Math.round(iLabel / screenedLabels.length * 100));
      }

      let labelLines = screenedLabels[iLabel];

      // Are we at the beginning of a page or column?
      if (iLabel % labelsPerPageDisplay === 0) {
        if (iLabel > 0) {
          // Advance to next page
          doc.addPage(
            subsequentPageOptions.format || "letter",
            subsequentPageOptions.orientation || "portrait"
          );
          ++currentPageNum;
        }

        // Prep the new page
        column = 0;
        currentLabelLeft = labelSpec.pageDimensions.leftMargin + (column * (labelSpec.pageDimensions.width + labelSpec.horizGapIn));
        row = 0;

      } else if (iLabel % labelSpec.numLabelsDown === 0) {
        // Advance to next column
        currentLabelLeft = labelSpec.pageDimensions.leftMargin + (++column * (labelSpec.labelWidth + labelSpec.horizGapIn));
        row = 0;
      }

      // Draw the label
      // Don't use more lines than the label can hold; clip overlong lines; append ellipses to clipped lines
      labelLines = clipOverlongLines(doc, labelLines.slice(0, labelSpec.maxNumLabelLines), maxLabelTextWidth);

      // Draw label; text origin is on bottom, and we move it up based on the number of lines so that it is
      // vertically centered in label
      currentLabelTop = calculateLabelTop(labelSpec.pageDimensions.topMargin, row++, labelSpec.labelHeight, labelSpec.vertGapIn);
      doc.text(
        labelLines,
        currentLabelLeft + labelSpec.labelPadding,
        calculateLabelFirstLineBase(currentLabelTop, labelSpec.labelHeight, labelLines.length, fontHeight, verticalFontGap)
      );
    }

    if (progressCallback) {
      progressCallback(100);
    }

    resolve(currentPageNum);
  });
}

/**
 * Calculates the baseline position of the first line of text in a label.
 *
 * @param labelTop Offset from top of document to top of label
 * @param labelHeight Height of each label in doc units
 * @param numLabelLines Number of lines to be drawn in the label
 * @param fontHeight Height of text in doc units
 * @param verticalFontGap Spacing between lines of text in doc units
 * @returns Baseline position
 */
export function calculateLabelFirstLineBase(
  labelTop: number,
  labelHeight: number,
  numLabelLines: number,
  fontHeight: number,
  verticalFontGap: number
): number {
  const labelVerticalMidpoint = labelTop + (labelHeight / 2);
  return labelVerticalMidpoint +
    (2 - numLabelLines) / 2 * fontHeight +
    (1 - numLabelLines) / 2 * verticalFontGap;
}

/**
 * Calculates the offset from the page top to the top of a label in a specified row.
 *
 * @param topMargin Offset from top of document to top of drawing area
 * @param row Zero-based row number
 * @param labelHeight Height of each label in doc units
 * @param vertGapIn Space between rows of labels in doc units
 * @return Offset to top of label
 */
export function calculateLabelTop(
  topMargin: number,
  row: number,
  labelHeight: number,
  vertGapIn: number
): number {
  return topMargin + (row * (labelHeight + vertGapIn));
}

export function drawLabelGuidelines(
  doc: jspdf.jsPDF,
  labelSpec: ILabelSpec,
  labelBoundaryLinesProperties: grid.ILineProperties = null,
  measurementLinesProperties: grid.IMeasurementLineProperties = null
): void {
  // Label boundaries
  if (labelBoundaryLinesProperties !== null) {
    grid.drawGridBoxes(
      doc,
      labelSpec.numLabelsAcross,
      labelSpec.numLabelsDown,
      labelSpec.pageDimensions.leftMargin,
      labelSpec.pageDimensions.topMargin,
      labelSpec.labelWidth,
      labelSpec.labelHeight,
      labelSpec.horizGapIn,
      labelSpec.vertGapIn,
      labelBoundaryLinesProperties
    );
  }

  // Measurement lines
  if (measurementLinesProperties !== null) {
    grid.drawMeasurementLines(
      doc,
      {
        width: labelSpec.pageDimensions.width -
          labelSpec.pageDimensions.leftMargin - labelSpec.pageDimensions.rightMargin,
        height: labelSpec.pageDimensions.height -
          labelSpec.pageDimensions.topMargin - labelSpec.pageDimensions.bottomMargin,
        leftMargin: labelSpec.pageDimensions.leftMargin,
        rightMargin: 0,
        topMargin: labelSpec.pageDimensions.topMargin,
        bottomMargin: 0
      },
      measurementLinesProperties
    );
  }
}

/**
 * Returns the UI descriptions of the label formats known to the extended jsPDF `doc` object.
 *
 * @param doc jsPDF `doc` object with label extensions
 * @returns List of label format descriptions
 */
export function getAvailableLabelFormats(
  doc: IjsPDFExt
): ILabelDescription[] {
  if (doc.labelFormats) {
    return doc.labelFormats.map(
      (format) => format.descriptionPDF
    );
  } else {
    return [] as ILabelDescription[]
  }
}

/**
 * Returns the format of the specified label.
 *
 * @param doc jsPDF `doc` object with label extensions
 * @param averyPartNumber Avery® label base part number, e.g., "*60" (versus actual part numbers "5160", "8160",
 * "8460", "48160"--all of which are 1" x 2-5/8" rectangular labels)
 * @returns List of label format descriptions
 */
export function getLabelFormat(
  doc: IjsPDFExt,
  averyPartNumber: string
): ILabel {
  if (doc.labelFormats) {
    const matches = doc.labelFormats.filter(
      (format) => averyPartNumber === format.descriptionPDF.averyPartNumber
    );
    if (matches.length > 0) {
      return matches[0];
    } else {
      return null;
    }
} else {
    return null;
  }
}

/**
 * Loads language font file and label formats into a jsPDF `doc` object.
 *
 * @param doc jsPDF `doc` object
 * @param dataPath Path to the library's data files
 * @param lang Locale such as "en" or "en-gb"
 * @returns Created jsPDF `doc` object with label extensions
 * @throws TypeError "startPDFLabelDoc is stomping on labelFormats property" if the `labelFormats` property
 * is found in doc before the label formats are loaded into the doc.
 */
export function initPDFLabelDoc(
  doc: jspdf.jsPDF,
  dataPath: string,
  lang = "en-us"
): Promise<IjsPDFExt> {
  // tslint:disable-next-line: no-floating-promises
  return Promise.all([
    pdf.loadLanguageFontFile(doc, dataPath, lang),
    loadLabelFormats(dataPath)
  ])
  .then(
    (result: [jspdf.jsPDF, any]) => {
      const [doc, labelFormats] = result;
      if ((doc as any).labelFormats) {
        // Internal check that the labelFormats property is not part of a jsPDF doc
        throw new TypeError("startPDFLabelDoc is stomping on labelFormats property");
      }
      const docExt: IjsPDFExt = doc as IjsPDFExt;
      docExt.labelFormats = labelFormats;
      return docExt;
    }
  );
}

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Trims a set of text lines to fit within specified bounds.
 *
 * @param {object} doc jsPDF document
 * @param lines Text lines to be trimmed
 * @param maxTextWidth The maximum width permitted for the drawing of the text in doc units
 * @returns A copy of lines trimmed as necessary
 * @private
 */
export function clipOverlongLines(
  doc: jspdf.jsPDF,
  lines: string[],
  maxTextWidth: number
): string[] {
  const trimmedLines = [] as string[];

  lines.forEach(
    line => {
      if (getTextWidth(doc, line) > maxTextWidth) {
        do {
          line = line.slice(0, -1);
        } while (getTextWidth(doc, line) > maxTextWidth);
        line += '...';
      }
      trimmedLines.push(line);
    }
  );

  return trimmedLines;
}

/**
 * Estimates with width of a string based on the current jsPDF document settings.
 *
 * @param {object} doc jsPDF document
 * @param {string} text String to estimate
 * @returns {number} Estimated width of text in doc units
 * @private
 */
export function getTextWidth(
  doc: jspdf.jsPDF,
  text: string
): number {
  return doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
}

/**
 * Loads the label formats.
 *
 * @param dataPath Path to the library's data files
 * @returns Promise resolving to the label formats JSON
 * @private
 */
export function loadLabelFormats(
  dataPath: string
): Promise<ILabel[]> {
  return fetch(dataPath + "labelFormats.json")
  .then(
    (labelFormatsFile) => {
      return labelFormatsFile.json();
    }
  )
  .then(
    (labelFormatsJson) => {
      return labelFormatsJson;
    }
  );
}
