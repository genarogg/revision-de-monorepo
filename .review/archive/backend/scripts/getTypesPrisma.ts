import * as fs from "fs";
import * as path from "path";

// ─── Mapeo de tipos Prisma → TypeScript ───────────────────────────────────────

const prismaToTsType: Record<string, string> = {
  String: "string",
  Int: "number",
  Float: "number",
  Boolean: "boolean",
  DateTime: "Date",
  Json: "Record<string, unknown>",
  BigInt: "bigint",
  Decimal: "number",
  Bytes: "Buffer",
};

// ─── Estructuras internas ─────────────────────────────────────────────────────

interface ParsedField {
  name: string;
  type: string;
  isOptional: boolean;
  isList: boolean;
  hasDefault: boolean;
  isRelation: boolean;
}

interface ParsedModel {
  name: string;
  fields: ParsedField[];
}

interface ParsedEnum {
  name: string;
}

// ─── Parser del schema.prisma ─────────────────────────────────────────────────

function parseSchema(
  schemaContent: string
): { models: ParsedModel[]; enums: ParsedEnum[] } {
  const enums: ParsedEnum[] = [];
  const models: ParsedModel[] = [];

  // Extraer enums
  const enumRegex = /^enum\s+(\w+)\s*\{([^}]*)\}/gm;
  let match: RegExpExecArray | null;

  while ((match = enumRegex.exec(schemaContent)) !== null) {
    enums.push({ name: match[1] });
  }

  const enumNames = new Set(enums.map((e) => e.name));
  const primitiveTypes = new Set(Object.keys(prismaToTsType));

  // Extraer modelos
  const modelRegex = /^model\s+(\w+)\s*\{([^}]*)\}/gm;

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const body = match[2];
    const fields: ParsedField[] = [];

    for (const rawLine of body.split("\n")) {
      const line = rawLine.trim();

      // Ignorar líneas vacías, comentarios y atributos de bloque
      if (!line || line.startsWith("//") || line.startsWith("@@")) continue;

      // Patrón: fieldName  Type[]? @decoradores...
      // Ejemplos válidos:
      //   id        String   @id @default(cuid())
      //   tags      String[]
      //   email     String?
      //   usuario   Usuario  @relation(...)
      const fieldMatch = line.match(/^(\w+)\s+(\w+)(\[\])?(\?)?(.*)?$/);
      if (!fieldMatch) continue;

      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];
      const isList = fieldMatch[3] === "[]";
      const isOptional = fieldMatch[4] === "?";
      const decorators = fieldMatch[5] ?? "";

      // Tiene default si tiene @default(...) o @updatedAt
      const hasDefault =
        decorators.includes("@default(") || decorators.includes("@updatedAt");

      // Es relación si el tipo no es primitivo ni enum
      const isRelation =
        !primitiveTypes.has(fieldType) && !enumNames.has(fieldType);

      fields.push({
        name: fieldName,
        type: fieldType,
        isOptional,
        isList,
        hasDefault,
        isRelation,
      });
    }

    models.push({ name: modelName, fields });
  }

  return { models, enums };
}

// ─── Generador de tipos ───────────────────────────────────────────────────────

function mapFieldType(type: string, isList: boolean): string {
  const tsType = prismaToTsType[type] ?? type;
  return isList ? `${tsType}[]` : tsType;
}

function getTypesPrisma(): void {
  // Buscar schema.prisma (soporta mono-repo y estructura estándar)
  const possibleSchemaPaths = [
    path.resolve(process.cwd(), "prisma/schema.prisma"),
    path.resolve(process.cwd(), "../prisma/schema.prisma"),
    path.resolve(process.cwd(), "schema.prisma"),
  ];

  const schemaPath = possibleSchemaPaths.find((p) => fs.existsSync(p));

  if (!schemaPath) {
    console.error(
      "❌ No se encontró schema.prisma. Rutas buscadas:\n",
      possibleSchemaPaths.join("\n")
    );
    process.exit(1);
  }

  console.log(`📄 Usando schema: ${schemaPath}`);

  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  const { models, enums } = parseSchema(schemaContent);

  // ── Salida global ──────────────────────────────────────────────────────────
  const globalPath = path.resolve(process.cwd(), "../global");
  fs.mkdirSync(globalPath, { recursive: true });

  const enumNames = new Set(enums.map((e) => e.name));

  console.log("Enums detectados:", [...enumNames]);

  // Debug de campos
  models.forEach((model) => {
    console.log(`\n=== ${model.name} ===`);
    model.fields.forEach((f) => {
      console.log(
        `  ${f.name}: isOptional=${f.isOptional}, hasDefault=${f.hasDefault}, isList=${f.isList}, isRelation=${f.isRelation}`
      );
    });
  });

  // ── Generar interfaces ─────────────────────────────────────────────────────
  const interfacesContent = models
    .map((model) => {
      const fields = model.fields
        .map((field) => {
          const tsType = mapFieldType(field.type, field.isList);

          // Reglas de opcionalidad para tipos de OUTPUT (lo que devuelve la BD):
          // - Relaciones → siempre opcionales (dependen del `include`)
          // - Listas      → nunca opcionales (Prisma devuelve [] si está vacío)
          // - Con default → nunca opcionales (la BD siempre lo tendrá)
          // - isOptional  → opcional (campo nullable en el schema)
          const isEffectivelyOptional =
            field.isRelation ||
            (!field.isList && !field.hasDefault && field.isOptional);

          const marker = isEffectivelyOptional ? "?" : "";
          return `  ${field.name}${marker}: ${tsType}`;
        })
        .join("\n");

      return `export interface ${model.name} {\n${fields}\n}`;
    })
    .join("\n\n");

  const importLine =
    enumNames.size > 0
      ? `import { ${[...enumNames].join(", ")} } from "./enums"\n\n`
      : "";

  fs.writeFileSync(
    path.join(globalPath, "prismaTypes.ts"),
    importLine + interfacesContent,
    "utf-8"
  );

  console.log(`\n✅ prismaTypes.ts generado en: ${globalPath}`);
}

getTypesPrisma();