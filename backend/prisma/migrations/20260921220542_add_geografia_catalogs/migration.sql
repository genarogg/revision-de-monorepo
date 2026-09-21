-- CreateTable
CREATE TABLE "Estado" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_pais" (
    "id" SERIAL NOT NULL,
    "estado" TEXT NOT NULL,
    "vigencia" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "estado_pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipio" (
    "id" SERIAL NOT NULL,
    "estadoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "vigencia" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "municipio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poblado" (
    "id" SERIAL NOT NULL,
    "municipioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "vigencia" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "poblado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zona_urbanizacion" (
    "id" SERIAL NOT NULL,
    "pobladoId" INTEGER NOT NULL,
    "codigoPostal" INTEGER NOT NULL,
    "zona" TEXT NOT NULL,
    "vigencia" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "zona_urbanizacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estado_nombre_key" ON "Estado"("nombre");

-- CreateIndex
CREATE INDEX "municipio_estadoId_idx" ON "municipio"("estadoId");

-- CreateIndex
CREATE INDEX "poblado_municipioId_idx" ON "poblado"("municipioId");

-- CreateIndex
CREATE INDEX "zona_urbanizacion_pobladoId_idx" ON "zona_urbanizacion"("pobladoId");

-- CreateIndex
CREATE INDEX "zona_urbanizacion_codigoPostal_idx" ON "zona_urbanizacion"("codigoPostal");

-- AddForeignKey
ALTER TABLE "municipio" ADD CONSTRAINT "municipio_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estado_pais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poblado" ADD CONSTRAINT "poblado_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zona_urbanizacion" ADD CONSTRAINT "zona_urbanizacion_pobladoId_fkey" FOREIGN KEY ("pobladoId") REFERENCES "poblado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
