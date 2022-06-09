[![Build status][travis-img]][travis-url]
[![Apache 2.0 licensed][license-img]][license-url]

[travis-img]: https://img.shields.io/travis/Esri/solutions-libraries/develop.svg
[travis-url]: https://app.travis-ci.com/github/Esri/solutions-libraries
[license-img]: https://img.shields.io/badge/license-Apache%202.0-blue.svg
[license-url]: #license

# arcgis-pdf-creator

Provides helpers for using the [jsPDF](https://github.com/parallax/jsPDF) library:

* General PDF generation
* Generation of PDFs for Avery&reg; labels

## Requirements

Supported browsers are the latest versions of Google Chrome, Apple Safari, Mozilla Firefox, and Microsoft Edge (Chromium).

## API Overview

The API documentation is published at
https://miketschudi.github.io/arcgis-pdf-creator

## Getting Started

Set up:

```bash
npm install
```

Run the tests:

```bash
npm run test
```

Lint:

```bash
npm run lint
npm run lint:fix
```

Create documentation into `doc` folder and then deploy it:

```bash
npm run docs:build
npm run docs:deploy
```

Build sample program into `dist` folder:

```bash
npm run build
```

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Licensing

Copyright 2022 Esri

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

A copy of the license is available in the repository's [LICENSE](./LICENSE) file.

Additional licenses:

* [jsPDF](./LICENSE_jsPDF.md)
* [Esri 0b7681dc140844ee9f409bdac249fbf0-* font family](./LICENSE_font.md)
