export default [
  {
    extends: [
      "next/core-web-vitals", // Configurações recomendadas para Next.js
      "next/typescript", // Suporte para TypeScript
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Desativa a regra que proíbe o uso de `any`
    },
  },
];