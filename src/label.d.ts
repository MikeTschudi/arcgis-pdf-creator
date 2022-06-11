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
export declare type IAddLabelsToDocProgressCallback = (
/**
 * Percent done; range 0..100
 */
percentDone: number) => void;
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
export declare function addLabelsToDoc(doc: jspdf.jsPDF, labels: string[][], labelSpec: ILabelSpec, startingPageNum: number, subsequentPageOptions?: pdf.IPDFOptions, progressCallback?: IAddLabelsToDocProgressCallback): Promise<number>;
export declare function drawLabelGuidelines(doc: jspdf.jsPDF, labelSpec: ILabelSpec, labelBoundaryLinesProperties?: grid.ILineProperties, measurementLinesProperties?: grid.IMeasurementLineProperties): void;
/**
 * Returns the UI descriptions of the label formats known to the extended jsPDF `doc` object.
 *
 * @param doc jsPDF `doc` object with label extensions
 * @returns List of label format descriptions
 */
export declare function getAvailableLabelFormats(doc: IjsPDFExt): ILabelDescription[];
/**
 * Returns the format of the specified label.
 *
 * @param doc jsPDF `doc` object with label extensions
 * @param averyPartNumber Avery® label base part number, e.g., "*60" (versus actual part numbers "5160", "8160",
 * "8460", "48160"--all of which are 1" x 2-5/8" rectangular labels)
 * @returns List of label format descriptions
 */
export declare function getLabelFormat(doc: IjsPDFExt, averyPartNumber: string): ILabel;
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
export declare function initPDFLabelDoc(doc: jspdf.jsPDF, dataPath: string, lang?: string): Promise<IjsPDFExt>;
/**
 * Trims a set of text lines to fit within specified bounds.
 *
 * @param {object} doc jsPDF document
 * @param lines Text lines to be trimmed
 * @param maxTextWidth The maximum width permitted for the drawing of the text in doc units
 * @returns A copy of lines trimmed as necessary
 * @private
 */
export declare function clipOverlongLines(doc: jspdf.jsPDF, lines: string[], maxTextWidth: number): string[];
/**
 * Estimates with width of a string based on the current jsPDF document settings.
 *
 * @param {object} doc jsPDF document
 * @param {string} text String to estimate
 * @returns {number} Estimated width of text in doc units
 * @private
 */
export declare function getTextWidth(doc: jspdf.jsPDF, text: string): number;
/**
 * Loads the label formats.
 *
 * @param dataPath Path to the library's data files
 * @returns Promise resolving to the label formats JSON
 * @private
 */
export declare function loadLabelFormats(dataPath: string): Promise<ILabel[]>;
