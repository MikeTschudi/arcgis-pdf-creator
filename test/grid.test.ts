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

//--------------------------------------------------------------------------------------------------------------------//

describe("Module `grid`: grid-generating PDF routines", () => {

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
