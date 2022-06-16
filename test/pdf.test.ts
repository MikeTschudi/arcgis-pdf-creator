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

import * as pdf from "../src/pdf";

//--------------------------------------------------------------------------------------------------------------------//

describe("Module `pdf`: general PDF helper routines", () => {

  describe("loadLanguageFontFile", () => {

    it("handles previously unknown file", done => {
      const fetchSpy = spyOn(window, "fetch").and.resolveTo(
        new Response(
          new Blob(["Hello world!"], { type: "text/plain" })
        )
      );
      const fakeDoc = Object.assign({
        addFileToVFS: (filename: string, filecontent: string) => {},
        addFont: (postScriptName: string, id: string, fontStyle: string, fontWeight: string) => {},
        existsFileInVFS: (filename: string) => {},
        setFont: (fontName: string, fontStyle: string, fontWeight: string) => {},
        setLanguage: (langCode: string) => {},
        setR2L: (value: boolean) => {}
      });
      const addFileToVFSSpy = spyOn(fakeDoc, "addFileToVFS");
      const addFontSpy = spyOn(fakeDoc, "addFont");
      const existsFileInVFSSpy = spyOn(fakeDoc, "existsFileInVFS").and.returnValue(false);
      const setFontSpy = spyOn(fakeDoc, "setFont");
      const setR2LSpy = spyOn(fakeDoc, "setR2L");

      pdf.loadLanguageFontFile(fakeDoc, "", "fr")
      .then(
        (ok) => {
          expect(fetchSpy.calls.count()).withContext("should call fetch once").toEqual(1);

          expect(existsFileInVFSSpy.calls.count()).withContext("should call existsFileInVFS once").toEqual(1);
          expect(existsFileInVFSSpy.calls.argsFor(0)[0]).withContext("check existsFileInVFS's filename arg").toEqual("0b7681dc140844ee9f409bdac249fbf0-general.ttf");

          expect(addFileToVFSSpy.calls.count()).withContext("should call addFileToVFS once").toEqual(1);
          expect(addFileToVFSSpy.calls.argsFor(0)[0]).withContext("check addFileToVFS's fontName arg").toEqual("0b7681dc140844ee9f409bdac249fbf0-general.ttf");
          expect(addFileToVFSSpy.calls.argsFor(0)[1]).withContext("check addFileToVFS's filecontent arg").toEqual("Hello world!");

          expect(addFontSpy.calls.count()).withContext("should call addFontSpy once").toEqual(1);
          expect(addFontSpy.calls.argsFor(0)[0]).withContext("check addFontSpy's postScriptName arg").toEqual("0b7681dc140844ee9f409bdac249fbf0-general.ttf");
          expect(addFontSpy.calls.argsFor(0)[1]).withContext("check addFontSpy's id arg").toEqual("0b7681dc140844ee9f409bdac249fbf0-general");
          expect(addFontSpy.calls.argsFor(0)[2]).withContext("check addFontSpy's fontStyle arg").toEqual("normal");
          expect(addFontSpy.calls.argsFor(0)[3]).withContext("check addFontSpy's fontStyle arg").toEqual("normal");

          expect(setFontSpy.calls.count()).withContext("should call setFont once").toEqual(1);
          expect(setFontSpy.calls.argsFor(0)[0]).withContext("check setFont's fontName arg").toEqual("0b7681dc140844ee9f409bdac249fbf0-general");

          expect(setR2LSpy.calls.count()).withContext("should not call setR2L").toEqual(0);

          done();
        },
        () => {
          done.fail();
        }
      );
    });

    it("handles previously loaded file", done => {
      const fetchSpy = spyOn(window, "fetch").and.resolveTo(
        new Response(
          new Blob(["Hello world!"], { type: "text/plain" })
        )
      );
      const fakeDoc = Object.assign({
        addFileToVFS: (filename: string, filecontent: string) => {},
        addFont: (postScriptName: string, id: string, fontStyle: string, fontWeight: string) => {},
        existsFileInVFS: (filename: string) => {},
        setFont: (fontName: string, fontStyle: string, fontWeight: string) => {},
        setLanguage: (langCode: string) => {},
        setR2L: (value: boolean) => {}
      });
      const addFileToVFSSpy = spyOn(fakeDoc, "addFileToVFS");
      const addFontSpy = spyOn(fakeDoc, "addFont");
      const existsFileInVFSSpy = spyOn(fakeDoc, "existsFileInVFS").and.returnValue(true);
      const setFontSpy = spyOn(fakeDoc, "setFont");
      const setLanguage = spyOn(fakeDoc, "setLanguage");
      const setR2LSpy = spyOn(fakeDoc, "setR2L");

      pdf.loadLanguageFontFile(fakeDoc, "")
      .then(
        (ok) => {
          expect(fetchSpy.calls.count()).withContext("should not call fetch").toEqual(0);

          expect(addFileToVFSSpy.calls.count()).withContext("should not  call addFileToVFS").toEqual(0);

          expect(addFontSpy.calls.count()).withContext("should not  call addFontSpy").toEqual(0);

          expect(existsFileInVFSSpy.calls.count()).withContext("should call existsFileInVFS once").toEqual(1);
          expect(existsFileInVFSSpy.calls.argsFor(0)[0]).withContext("check existsFileInVFS's filename arg").toEqual("0b7681dc140844ee9f409bdac249fbf0-general.ttf");

          expect(setFontSpy.calls.count()).withContext("should call setFont once").toEqual(1);
          expect(setFontSpy.calls.argsFor(0)[0]).withContext("check setFont's fontName arg").toEqual("0b7681dc140844ee9f409bdac249fbf0-general");

          expect(setLanguage.calls.count()).withContext("should call setLanguage once").toEqual(1);
          expect(setLanguage.calls.argsFor(0)[0]).withContext("check setLanguage's langCode arg").toEqual("en-US");

          expect(setR2LSpy.calls.count()).withContext("should not call setR2L").toEqual(0);

          done();
        },
        () => {
          done.fail();
        }
      );
    });

  });

  describe("convertLocaleToJsPDFLanguageCode", () => {

    it("handles it-it special case", () => {
      expect(pdf.convertLocaleToJsPDFLanguageCode("it-it")).toEqual("it");
    });

    it("handles pt-pt special case", () => {
      expect(pdf.convertLocaleToJsPDFLanguageCode("pt-pt")).toEqual("pt");
    });

    it("handles language only", () => {
      expect(pdf.convertLocaleToJsPDFLanguageCode("fr")).toEqual("fr");
    });

    it("handles language and country", () => {
      expect(pdf.convertLocaleToJsPDFLanguageCode("fr-fr")).toEqual("fr-FR");
    });

  });

  describe("getFontFilename", () => {

    it("handles Japanese special case", () => {
      expect(pdf.getFontFilename("ja")).toEqual("0b7681dc140844ee9f409bdac249fbf0-japanese");
    });

    it("handles Korean special case", () => {
      expect(pdf.getFontFilename("ko")).toEqual("0b7681dc140844ee9f409bdac249fbf0-korean");
    });

    it("handles Simplified Chinese special case", () => {
      expect(pdf.getFontFilename("zh-cn")).toEqual("0b7681dc140844ee9f409bdac249fbf0-simplified-chinese");
    });

    it("handles Traditional Chinese (Hong Kong) special case", () => {
      expect(pdf.getFontFilename("zh-hk")).toEqual("0b7681dc140844ee9f409bdac249fbf0-traditional-chinese");
    });

    it("handles Traditional Chinese (Taiwan) special case", () => {
      expect(pdf.getFontFilename("zh-tw")).toEqual("0b7681dc140844ee9f409bdac249fbf0-traditional-chinese");
    });

    it("falls back to general case", () => {
      expect(pdf.getFontFilename("fr")).toEqual("0b7681dc140844ee9f409bdac249fbf0-general");
    });

  });

  describe("isCJK", () => {

    it("handles Japanese", () => {
      expect(pdf.isCJK("ja")).toEqual(true);
    });

    it("handles Korean", () => {
      expect(pdf.isCJK("ko")).toEqual(true);
    });

    it("handles Simplified Chinese", () => {
      expect(pdf.isCJK("zh-cn")).toEqual(true);
    });

    it("handles Traditional Chinese (Hong Kong)", () => {
      expect(pdf.isCJK("zh-hk")).toEqual(true);
    });

    it("handles Traditional Chinese (Taiwan)", () => {
      expect(pdf.isCJK("zh-tw")).toEqual(true);
    });

    it("handles non-CJK language", () => {
      expect(pdf.isCJK("fr")).toEqual(false);
    });

  });

  describe("setFont", () => {

    it("handles Hebrew", () => {
      const fakeDoc = Object.assign({
        setFont: (fontName: string, fontStyle: string, fontWeight: string) => {},
        setR2L: (value: boolean) => {}
      });
      const setFontSpy = spyOn(fakeDoc, "setFont");
      const setR2LSpy = spyOn(fakeDoc, "setR2L");

      pdf.setFont(fakeDoc, "he", "fontname");

      expect(setFontSpy.calls.count()).withContext("should call setFont once").toEqual(1);
      expect(setFontSpy.calls.argsFor(0)[0]).withContext("check setFont's fontName arg").toEqual("fontname");

      expect(setR2LSpy.calls.count()).withContext("should call setR2L once").toEqual(1);
      expect(setR2LSpy.calls.argsFor(0)[0]).withContext("check setR2L's value arg").toBeTruthy();
    });

    it("handles non-Hebrew language", () => {
      const fakeDoc = Object.assign({
        setFont: (fontName: string, fontStyle: string, fontWeight: string) => {},
        setR2L: (value: boolean) => {}
      });
      const setFontSpy = spyOn(fakeDoc, "setFont");
      const setR2LSpy = spyOn(fakeDoc, "setR2L");

      pdf.setFont(fakeDoc, "fr", "fontname");

      expect(setFontSpy.calls.count()).withContext("should call setFont once").toEqual(1);
      expect(setFontSpy.calls.argsFor(0)[0]).withContext("check setFont's fontName arg").toEqual("fontname");

      expect(setR2LSpy.calls.count()).withContext("should not call setR2L").toEqual(0);
    });

  });

});
