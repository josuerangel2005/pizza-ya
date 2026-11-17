// Pruebas de la página principal (S1, S3, S4 y la integración con el backend).
// Ejecutan el código real de la página (src/app/page.tsx) en Node y revisan el
// HTML que produciría el navegador contra un DOM simulado, sin dependencias nuevas.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { Writable } from "node:stream";
import React from "react";
import { renderToStaticMarkup, renderToPipeableStream } from "react-dom/server";
import { GiPizzaSlice } from "react-icons/gi";
import { parseHtml, texto, outerHtml } from "./dom.mjs";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Transpila el código de la página a CommonJS para poder ejecutarlo en Node.
execFileSync(
  process.execPath,
  [
    path.join(webRoot, "node_modules", "typescript", "bin", "tsc"),
    path.join(webRoot, "src", "app", "page.tsx"),
    "--jsx", "react-jsx",
    "--module", "commonjs",
    "--moduleResolution", "node",
    "--target", "es2020",
    "--esModuleInterop",
    "--skipLibCheck",
    "--outDir", path.join(webRoot, "test", ".compiled"),
  ],
  { stdio: "inherit" },
);

const require = createRequire(import.meta.url);
const page = require("./.compiled/page.js");
const inventario = require("./.compiled/inventario.js");

const iconoPizza = renderToStaticMarkup(
  React.createElement(GiPizzaSlice, { "aria-hidden": "true" }),
);

const datosEjemplo = [
  { nombre: "Queso mozzarella", cantidad: 2, minimo: 5 },
  { nombre: "Levadura", cantidad: 0, minimo: 3 },
  { nombre: "Jamón", cantidad: 1, minimo: 4 },
];

test("S1: el encabezado muestra el ícono de pizza de react-icons junto al texto 'Pizza-Ya! Inventario'", () => {
  const html = renderToStaticMarkup(React.createElement(inventario.Encabezado));
  const document = parseHtml(html);
  const header = document.querySelector("header");
  assert.ok(header, "la página debe tener un <header>");
  assert.match(
    texto(header),
    /Pizza-Ya! Inventario/,
    "el encabezado debe contener el texto 'Pizza-Ya! Inventario'",
  );
  const icono = header.children.find((child) => child.tag === "svg");
  assert.ok(icono, "el encabezado debe incluir el ícono (svg) de pizza");
  assert.equal(
    outerHtml(icono),
    iconoPizza,
    "el ícono del encabezado debe ser el GiPizzaSlice de react-icons",
  );
});

test("S3: la página muestra el stock bajo en una tabla con columnas Ingrediente, Cantidad y Mínimo", () => {
  const html = renderToStaticMarkup(
    React.createElement(inventario.TablaStockBajo, { ingredientes: datosEjemplo }),
  );
  const document = parseHtml(html);
  const tabla = document.querySelector("table");
  assert.ok(tabla, "debe existir una <table>");
  const columnas = document.querySelectorAll("th").map((th) => texto(th).trim());
  assert.deepEqual(
    columnas,
    ["Ingrediente", "Cantidad", "Mínimo"],
    "las columnas deben ser Ingrediente, Cantidad y Mínimo",
  );
  const filas = document.querySelectorAll("tr").filter(
    (tr) => tr.children.some((child) => child.tag === "td"),
  );
  assert.equal(filas.length, datosEjemplo.length, "debe haber una fila por ingrediente");
  filas.forEach((fila, indice) => {
    const celdas = fila.children
      .filter((child) => child.tag === "td")
      .map((td) => texto(td).trim());
    const esperado = datosEjemplo[indice];
    assert.deepEqual(
      celdas,
      [esperado.nombre, String(esperado.cantidad), String(esperado.minimo)],
      `la fila ${indice} debe mostrar el ingrediente con su cantidad y mínimo`,
    );
  });
});

test("S4: si la lista está vacía, la página muestra 'No hay ingredientes con stock bajo'", () => {
  const html = renderToStaticMarkup(
    React.createElement(inventario.TablaStockBajo, { ingredientes: [] }),
  );
  const document = parseHtml(html);
  assert.ok(
    !document.querySelector("table"),
    "con la lista vacía no debe haber tabla",
  );
  assert.match(
    texto(document.document),
    /No hay ingredientes con stock bajo/,
    "debe mostrarse el mensaje 'No hay ingredientes con stock bajo'",
  );
});

test("integración: la página inicia sesión en el backend y consume GET /ingredientes/stock-bajo con el token", async () => {
  const fetchOriginal = globalThis.fetch;
  let urlSolicitada;
  let tokenEnviado;
  globalThis.fetch = async (url, opciones) => {
    const urlTexto = String(url);
    if (urlTexto.endsWith("/auth/login")) {
      assert.equal(opciones?.method, "POST", "el inicio de sesión debe ser POST /auth/login");
      const credenciales = JSON.parse(opciones.body);
      assert.equal(credenciales.usuario, "operador");
      assert.equal(credenciales.contrasena, "pizza-ya");
      return {
        ok: true,
        json: async () => ({ accessToken: "token-de-prueba" }),
      };
    }
    urlSolicitada = urlTexto;
    tokenEnviado = opciones?.headers?.Authorization;
    return { ok: true, json: async () => datosEjemplo };
  };
  try {
    const html = await new Promise((resolve, reject) => {
      const chunks = [];
      const { pipe } = renderToPipeableStream(React.createElement(page.default), {
        onAllReady() {
          const destino = new Writable({
            write(chunk, _encoding, callback) {
              chunks.push(chunk);
              callback();
            },
          });
          destino.on("finish", () => resolve(Buffer.concat(chunks).toString("utf8")));
          pipe(destino);
        },
        onError(error) {
          reject(error);
        },
      });
    });
    assert.match(
      String(urlSolicitada),
      /\/ingredientes\/stock-bajo$/,
      "la página debe pedir GET /ingredientes/stock-bajo al backend",
    );
    assert.equal(
      tokenEnviado,
      "Bearer token-de-prueba",
      "la página debe enviar el token del inicio de sesión en el encabezado Authorization",
    );
    const document = parseHtml(html);
    const header = document.querySelector("header");
    assert.ok(header, "la página principal debe tener el <header> de la marca");
    assert.match(texto(header), /Pizza-Ya! Inventario/);
    assert.ok(
      header.children.some((child) => child.tag === "svg"),
      "el encabezado debe mostrar el ícono de pizza",
    );
    const filas = document.querySelectorAll("tr").filter(
      (tr) => tr.children.some((child) => child.tag === "td"),
    );
    assert.equal(filas.length, datosEjemplo.length, "la tabla debe listar los ingredientes del backend");
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
