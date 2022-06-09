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
/**
 * Properties describing page dimensions.
 */
export interface IPageDimensions {
    width: number;
    height: number;
    leftMargin: number;
    rightMargin: number;
    topMargin: number;
    bottomMargin: number;
}
/**
 * Properties describing a page.
 */
export interface IPDFOptions {
    format?: string | number[];
    orientation?: "p" | "portrait" | "l" | "landscape";
    unit?: "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";
}
/**
 * Creates a jsPDF `doc` object.
 *
 * @param lang Locale such as "en" or "en-gb"
 * @param options Options for creating the `doc` object such as page size, orientation, and measurement units;
 * defaults to "letter", "portrait", "in"ches
 * @return Promise resolving to the created jsPDF `doc` object
 */
export declare function startPDFDoc(lang?: string, options?: IPDFOptions): Promise<jspdf.jsPDF>;
/**
 * Loads the font file for a language if it is not already loaded.
 *
 * @param doc jsPDF `doc` object
 * @param lang Locale such as "en" or "en-gb"
 * @return Promise resolving to the updated `doc` input
 */
export declare function loadLanguageFontFile(doc: jspdf.jsPDF, lang: string): Promise<jspdf.jsPDF>;
/**
 * Converts a locale into a jsPDF language code
 *
 * @param lang Locale such as "en" or "en-gb"
 * @return jsPDF_lang_code jsPDF language code such as "en" or "en-GB", mapping AGO locales "it-it" & "pt-pt"
 * into "it" & "pt", respectively, to match jsPDF offering
 */
export declare function convertLocaleToLanguageCode(lang: string): jsPDF_lang_code;
/**
 * Enumeration of putatively supported locales in jsPDF copied from jsPDF.
 */
declare type jsPDF_lang_code = "af" | "an" | "ar" | "ar-AE" | "ar-BH" | "ar-DZ" | "ar-EG" | "ar-IQ" | "ar-JO" | "ar-KW" | "ar-LB" | "ar-LY" | "ar-MA" | "ar-OM" | "ar-QA" | "ar-SA" | "ar-SY" | "ar-TN" | "ar-YE" | "as" | "ast" | "az" | "be" | "bg" | "bn" | "br" | "bs" | "ca" | "ce" | "ch" | "co" | "cr" | "cs" | "cv" | "cy" | "da" | "de" | "de-AT" | "de-CH" | "de-DE" | "de-LI" | "de-LU" | "el" | "en" | "en-AU" | "en-BZ" | "en-CA" | "en-GB" | "en-IE" | "en-JM" | "en-NZ" | "en-PH" | "en-TT" | "en-US" | "en-ZA" | "en-ZW" | "eo" | "es" | "es-AR" | "es-BO" | "es-CL" | "es-CO" | "es-CR" | "es-DO" | "es-EC" | "es-ES" | "es-GT" | "es-HN" | "es-MX" | "es-NI" | "es-PA" | "es-PE" | "es-PR" | "es-PY" | "es-SV" | "es-UY" | "es-VE" | "et" | "eu" | "fa" | "fa-IR" | "fi" | "fj" | "fo" | "fr" | "fr-BE" | "fr-CA" | "fr-CH" | "fr-FR" | "fr-LU" | "fr-MC" | "fur" | "fy" | "ga" | "gd" | "gd-IE" | "gl" | "gu" | "he" | "hi" | "hr" | "hsb" | "ht" | "hu" | "hy" | "id" | "is" | "it" | "it-CH" | "iu" | "ja" | "ji" | "ka" | "kk" | "km" | "kn" | "ko" | "ko-KP" | "ko-KR" | "ks" | "ky" | "la" | "lb" | "lt" | "lv" | "mi" | "mk" | "ml" | "mo" | "mr" | "ms" | "mt" | "my" | "nb" | "ne" | "ng" | "nl" | "nl-BE" | "nn" | "no" | "nv" | "oc" | "om" | "or" | "pa" | "pa-IN" | "pa-PK" | "pl" | "pt" | "pt-BR" | "qu" | "rm" | "ro" | "ro-MO" | "ru" | "ru-MO" | "sa" | "sb" | "sc" | "sd" | "sg" | "si" | "sk" | "sl" | "so" | "sq" | "sr" | "sv" | "sv-FI" | "sv-SV" | "sw" | "sx" | "sz" | "ta" | "te" | "th" | "tig" | "tk" | "tlh" | "tn" | "tr" | "ts" | "tt" | "uk" | "ur" | "ve" | "vi" | "vo" | "wa" | "xh" | "zh" | "zh-CN" | "zh-HK" | "zh-SG" | "zh-TW" | "zu";
export {};
