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
export * from "./pdf";
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
    widthLabelIn: string;
    heightLabelIn: string;
    labelsPerPage: string;
    averyPartNumber: string;
}
/**
 * Properties describing page dimensions of labels sheet.
 */
export interface ILabelSpec {
    type: string;
    pageDimensions: pdf.IPageDimensions;
    numLabelsAcross: number;
    numLabelsDown: number;
    labelWidth: number;
    labelHeight: number;
    horizGapIn: number;
    vertGapIn: number;
    labelPadding: number;
    fontSizePx: number;
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
 * Add labels to a PDF doc.
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
/**
 * Creates a jsPDF `doc` object.
 *
 * @param lang Locale such as "en" or "en-gb"
 * @param options Options for creating the `doc` object such as page size, orientation, and measurement units
 * @return Created jsPDF `doc` object
 */
export declare function startPDFLabelDoc(lang?: string, options?: pdf.IPDFOptions): Promise<jspdf.jsPDF>;
