const presets = [
  "@babel/preset-env", 
  ["@babel/typescript", { jsxPragma: "h" }]
];
const plugins = [
  [
    "@babel/plugin-transform-react-jsx",
    {
      throwIfNamespace: false, // defaults to true
      pragma: "h",
      pragmaFrag: "Fragment",
      runtime: "automatic",
      importSource: "preact",
    },
  ],
];

const options = { presets, plugins }
export default options;
