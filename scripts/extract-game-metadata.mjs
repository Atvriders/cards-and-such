#!/usr/bin/env node
/**
 * Parse every web/src/games/<id>/index.ts and extract the GamePlugin metadata
 * fields (id, title, category, players, description, howToPlay, settings).
 *
 * The output is two generated files:
 *  - web/src/games/registry.generated.ts  — a `GAMES_META` array (metadata only).
 *  - web/src/games/loaders.generated.ts   — a `LOADERS` map for lazy import().
 *
 * The reducer / component / initialState fields are NOT included in the metadata
 * file so that importing the registry does not pull all 4500 game implementations
 * into the initial bundle.
 *
 * The settings field is reproduced verbatim as a string from the source so we
 * preserve `as const` / typed unions exactly.
 */
import * as ts from "typescript";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const GAMES_DIR = path.join(ROOT, "web/src/games");

function listGameIds() {
  return fs
    .readdirSync(GAMES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((id) => fs.existsSync(path.join(GAMES_DIR, id, "index.ts")))
    .sort();
}

/**
 * Find the GamePlugin object literal in a source file. We look for either:
 *   export const xxxPlugin: GamePlugin<...> = { ... };
 *   export const xxxPlugin = { ... } as ...;
 */
function findPluginLiteral(source) {
  const sf = ts.createSourceFile("index.ts", source, ts.ScriptTarget.ES2022, true);
  let result = null;
  let exportName = null;

  function visit(node) {
    if (result) return;
    if (
      ts.isVariableStatement(node)
      && node.modifiers
      && node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue;
        const name = decl.name.text;
        // Tolerate camelCase ("xxxPlugin") and snake_case ("xxx_plugin").
        if (!name.endsWith("Plugin") && !name.endsWith("_plugin")) continue;
        let init = decl.initializer;
        if (!init) continue;
        // Walk past `as ...` casts.
        while (init && (ts.isAsExpression(init) || ts.isTypeAssertionExpression?.(init))) {
          init = init.expression;
        }
        if (init && ts.isObjectLiteralExpression(init)) {
          result = init;
          exportName = name;
          return;
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return { literal: result, exportName, sourceFile: sf };
}

/**
 * Extract a property value as raw source text.
 */
function rawText(source, node) {
  return source.slice(node.pos, node.end).trim();
}

/**
 * Resolve a property assignment value to its source text. If the value is
 * an Identifier referencing a named const declared in the same file, follow
 * the reference.
 */
function resolveValueText(source, sf, valueNode) {
  // Identifier — may be a top-level const.
  if (ts.isIdentifier(valueNode)) {
    const name = valueNode.text;
    let found = null;
    sf.statements.forEach((stmt) => {
      if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          if (
            ts.isIdentifier(decl.name)
            && decl.name.text === name
            && decl.initializer
          ) {
            found = rawText(source, decl.initializer);
          }
        }
      }
    });
    if (found) return found;
    // Could not resolve — return the identifier text (caller may fail).
    return name;
  }
  return rawText(source, valueNode);
}

function extractMetadata(id, source) {
  const { literal, sourceFile } = findPluginLiteral(source);
  if (!literal) throw new Error(`No GamePlugin literal found in ${id}`);

  const props = new Map();
  for (const p of literal.properties) {
    if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name)) {
      props.set(p.name.text, p.initializer);
    } else if (ts.isShorthandPropertyAssignment(p)) {
      // shorthand like `settings` — value is the same identifier.
      props.set(p.name.text, p.name);
    }
  }

  const required = ["id", "title", "category", "players", "description", "settings"];
  for (const k of required) {
    if (!props.has(k)) throw new Error(`Missing field ${k} in ${id}`);
  }

  // Read literal-string fields so we can strict-validate.
  function asStringLiteral(node) {
    if (
      ts.isStringLiteral(node)
      || ts.isNoSubstitutionTemplateLiteral(node)
    ) return node.text;
    if (ts.isTemplateExpression(node)) {
      // Template with substitutions — fall back to source text.
      return null;
    }
    return null;
  }

  const idValue = asStringLiteral(props.get("id"));
  if (!idValue) throw new Error(`id must be a string literal in ${id}`);
  if (idValue !== id) {
    // The folder name and plugin id must match the registry expectations.
    // We DON'T enforce this — some games may legitimately differ — but warn.
    // For our lookups we use the *plugin id*, not the folder name.
  }

  const titleValue = asStringLiteral(props.get("title"));
  if (titleValue == null) throw new Error(`title must be a string literal in ${id}`);

  const categoryValue = asStringLiteral(props.get("category"));
  if (!categoryValue) throw new Error(`category must be a string literal in ${id}`);

  const descriptionValue = asStringLiteral(props.get("description"));
  if (descriptionValue == null) throw new Error(`description must be a string literal in ${id}`);

  // For complex values, splice raw text from the original source.
  const playersText = resolveValueText(source, sourceFile, props.get("players"));
  const settingsText = resolveValueText(source, sourceFile, props.get("settings"));

  let howToPlayValue = null;
  if (props.has("howToPlay")) {
    const node = props.get("howToPlay");
    howToPlayValue = asStringLiteral(node);
    // For template literals, splice raw source.
    if (howToPlayValue == null) howToPlayValue = { raw: rawText(source, node) };
  }

  return {
    id: idValue,
    folderId: id,
    title: titleValue,
    category: categoryValue,
    description: descriptionValue,
    howToPlay: howToPlayValue,
    playersText,
    settingsText,
  };
}

function jsonString(s) {
  return JSON.stringify(s);
}

function buildMetaEntry(meta) {
  const lines = [];
  lines.push("  {");
  lines.push(`    id: ${jsonString(meta.id)},`);
  lines.push(`    title: ${jsonString(meta.title)},`);
  lines.push(`    category: ${jsonString(meta.category)},`);
  lines.push(`    description: ${jsonString(meta.description)},`);
  if (meta.howToPlay != null) {
    if (typeof meta.howToPlay === "string") {
      lines.push(`    howToPlay: ${jsonString(meta.howToPlay)},`);
    } else {
      // Raw source text (template literal etc.).
      lines.push(`    howToPlay: ${meta.howToPlay.raw},`);
    }
  }
  lines.push(`    players: ${meta.playersText},`);
  lines.push(`    settings: ${meta.settingsText},`);
  lines.push("  },");
  return lines.join("\n");
}

function main() {
  const ids = listGameIds();
  console.error(`Scanning ${ids.length} games...`);
  const metas = [];
  const failures = [];
  for (const id of ids) {
    const file = path.join(GAMES_DIR, id, "index.ts");
    const src = fs.readFileSync(file, "utf8");
    try {
      metas.push(extractMetadata(id, src));
    } catch (e) {
      failures.push({ id, error: e.message });
    }
  }
  if (failures.length) {
    console.error(`\n${failures.length} extraction failures:`);
    for (const f of failures.slice(0, 25)) console.error(`  ${f.id}: ${f.error}`);
    if (failures.length > 25) console.error(`  ... and ${failures.length - 25} more`);
    process.exit(1);
  }

  // Stable order: by plugin id (alphabetical) so diffs stay sane.
  metas.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  // ---- registry.generated.ts ----
  const registryOut = [];
  registryOut.push("// AUTO-GENERATED — DO NOT EDIT BY HAND.");
  registryOut.push("// Regenerate via:  node scripts/extract-game-metadata.mjs");
  registryOut.push("//");
  registryOut.push("// Metadata-only export of every GamePlugin in web/src/games/. Reducers,");
  registryOut.push("// components and initialState live in each game's own index.ts and are");
  registryOut.push("// loaded lazily from PlayPage via loaders.generated.ts.");
  registryOut.push("");
  registryOut.push('import type { GamePlugin, SettingSchema } from "../platform/game-plugin/types.js";');
  registryOut.push("");
  registryOut.push("export type GameMetadata = Pick<");
  registryOut.push("  GamePlugin,");
  registryOut.push('  "id" | "title" | "category" | "description" | "players" | "howToPlay"');
  registryOut.push("> & { settings: SettingSchema };");
  registryOut.push("");
  registryOut.push("export const GAMES_META: GameMetadata[] = [");
  for (const m of metas) registryOut.push(buildMetaEntry(m));
  registryOut.push("];");
  registryOut.push("");
  fs.writeFileSync(
    path.join(GAMES_DIR, "registry.generated.ts"),
    registryOut.join("\n"),
  );

  // ---- loaders.generated.ts ----
  const loaderOut = [];
  loaderOut.push("// AUTO-GENERATED — DO NOT EDIT BY HAND.");
  loaderOut.push("// Regenerate via:  node scripts/extract-game-metadata.mjs");
  loaderOut.push("//");
  loaderOut.push("// Lazy dynamic-import map: gameId -> () => Promise<GamePlugin>.");
  loaderOut.push("// Each entry produces its own Vite chunk.");
  loaderOut.push("");
  loaderOut.push('import type { GamePlugin } from "../platform/game-plugin/types.js";');
  loaderOut.push("");
  loaderOut.push("type Loader = () => Promise<GamePlugin>;");
  loaderOut.push("");
  loaderOut.push("export const LOADERS: Record<string, Loader> = {");
  for (const m of metas) {
    // Each plugin is exported as <name>Plugin from index.ts. We don't know the
    // export name without re-parsing — but we can pick *any* exported binding
    // that ends in "Plugin" at runtime via a tiny dispatcher.
    loaderOut.push(`  ${jsonString(m.id)}: async () => {`);
    loaderOut.push(`    const mod = await import("./${m.folderId}/index.js");`);
    loaderOut.push(`    return findPlugin(mod, ${jsonString(m.id)});`);
    loaderOut.push(`  },`);
  }
  loaderOut.push("};");
  loaderOut.push("");
  loaderOut.push("function findPlugin(mod: Record<string, unknown>, id: string): GamePlugin {");
  loaderOut.push("  for (const v of Object.values(mod)) {");
  loaderOut.push("    if (v && typeof v === \"object\" && (v as { id?: unknown }).id === id) {");
  loaderOut.push("      return v as GamePlugin;");
  loaderOut.push("    }");
  loaderOut.push("  }");
  loaderOut.push("  throw new Error(`Plugin ${id} not found in module`);");
  loaderOut.push("}");
  loaderOut.push("");
  loaderOut.push("export async function loadGame(id: string): Promise<GamePlugin | null> {");
  loaderOut.push("  const fn = LOADERS[id];");
  loaderOut.push("  if (!fn) return null;");
  loaderOut.push("  return fn();");
  loaderOut.push("}");
  loaderOut.push("");
  fs.writeFileSync(
    path.join(GAMES_DIR, "loaders.generated.ts"),
    loaderOut.join("\n"),
  );

  console.error(`Wrote ${metas.length} entries.`);
}

main();
