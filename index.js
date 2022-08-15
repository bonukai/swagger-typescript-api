#!/usr/bin/env node

// Copyright (c) 2019-present acacode
// Node module: swagger-typescript-api
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
// Repository https://github.com/acacode/swagger-typescript-api

const { Command } = require("commander");
const { resolve } = require("path");
const { generateApi } = require("./src");
const { version, name: packageName } = require("./package.json");
const { TS_KEYWORDS, HTTP_CLIENT } = require("./src/constants");

const program = new Command(packageName);

program.storeOptionsAsProperties(true);

program
  .version(version, "-v, --version", "output the current version")
  .description("Generate api via swagger scheme.\nSupports OA 3.0, 2.0, JSON, yaml.");

program
  .requiredOption("-p, --path <path>", "path/url to swagger scheme")
  .option("-o, --output <output>", "output path of typescript api file", "./")
  .option("-n, --name <name>", "name of output typescript api file", "Api.ts")
  .option("-t, --templates <path>", "path to folder containing templates")
  .option(
    "-d, --default-as-success",
    'use "default" response status code as success response too.\n' +
      'some swagger schemas use "default" response status code as success response type by default.',
    false,
  )
  .option(
    "-r, --responses",
    "generate additional information about request responses\n" + "also add typings for bad responses",
    false,
  )
  .option("--union-enums", 'generate all "enum" types as union types (T1 | T2 | TN)', false)
  .option("--add-readonly", "generate readonly properties", false)
  .option("--route-types", "generate type definitions for API routes", false)
  .option("--no-client", "do not generate an API class", false)
  .option("--enum-names-as-values", "use values in 'x-enumNames' as enum values (not only as keys)", false)
  .option(
    "--extract-request-params",
    "extract request params to data contract (Also combine path params and query params into one object)",
    false,
  )
  .option("--extract-request-body", "extract request body type to data contract", false)
  .option("--extract-response-body", "extract response body type to data contract", false)
  .option("--modular", "generate separated files for http client, data contracts, and routes", false)
  .option("--js", "generate js api module with declaration file", false)
  .option(
    "--module-name-index <number>",
    "determines which path index should be used for routes separation (example: GET:/fruites/getFruit -> index:0 -> moduleName -> fruites)",
    0,
  )
  .option("--module-name-first-tag", "splits routes based on the first tag", false)
  .option("--disableStrictSSL", "disabled strict SSL", false)
  .option("--disableProxy", "disabled proxy", false)
  .option("--axios", "generate axios http client", false)
  .option("--unwrap-response-data", "unwrap the data item from the response", false)
  .option("--disable-throw-on-error", "Do not throw an error when response.ok is not true", false)
  .option("--single-http-client", "Ability to send HttpClient instance to Api constructor", false)
  .option("--silent", "Output only errors to console", false)
  .option("--default-response <type>", "default type for empty response schema", TS_KEYWORDS.VOID)
  .option("--type-prefix <string>", "data contract name prefix", "")
  .option("--type-suffix <string>", "data contract name suffix", "")
  .option("--clean-output", "clean output folder before generate api. WARNING: May cause data loss", false)
  .option("--patch", "fix up small errors in the swagger source definition", false);

program.parse(process.argv);

generateApi({
  name: program.name,
  url: program.path,
  generateRouteTypes: program.routeTypes,
  generateClient: !!(program.axios || program.client),
  httpClientType: program.axios ? HTTP_CLIENT.AXIOS : HTTP_CLIENT.FETCH,
  defaultResponseAsSuccess: program.defaultAsSuccess,
  defaultResponseType: program.defaultResponse,
  unwrapResponseData: program.unwrapResponseData,
  disableThrowOnError: program.disableThrowOnError,
  sortTypes: program.sortTypes,
  generateUnionEnums: program.unionEnums,
  addReadonly: program.addReadonly,
  generateResponses: program.responses,
  extractRequestParams: !!program.extractRequestParams,
  extractRequestBody: !!program.extractRequestBody,
  extractResponseBody: !!program.extractResponseBody,
  input: resolve(process.cwd(), program.path),
  output: resolve(process.cwd(), program.output || "."),
  templates: program.templates,
  modular: !!program.modular,
  toJS: !!program.js,
  enumNamesAsValues: program.enumNamesAsValues,
  moduleNameIndex: +(program.moduleNameIndex || 0),
  moduleNameFirstTag: program.moduleNameFirstTag,
  disableStrictSSL: !!program.disableStrictSSL,
  disableProxy: !!program.disableProxy,
  singleHttpClient: !!program.singleHttpClient,
  cleanOutput: !!program.cleanOutput,
  silent: !!program.silent,
  typePrefix: program.typePrefix,
  typeSuffix: program.typeSuffix,
  patch: !!program.patch,
}).catch((err) => {
  // NOTE collect all errors on top level and shows to users in any case
  console.error(err);

  process.exit(1);
});
