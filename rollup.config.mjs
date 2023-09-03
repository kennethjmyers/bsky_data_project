/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
import typescript from '@rollup/plugin-typescript';
import tsConfigPaths from 'rollup-plugin-ts-paths';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

const outputOptions = {
  sourcemap: false,
  preserveModules: true,
  preserveModulesRoot: "src",
};

export default {
	input: 'src/index.ts',
	output: [
		{
			dir: "dist",
			format: "cjs",
			entryFileNames: "[name].cjs",
			exports: "auto",
			...outputOptions,
		},
		{
			dir: "dist",
			format: "es",
			...outputOptions,
		},
	],
	external: [/node_modules/],
	plugins: [
		tsConfigPaths({
			// The directory the TS config file can be found in (optional)
			tsConfigDirectory: process.cwd()
		}),
		nodeResolve(),
		json(),
		commonjs(), 
		typescript({
			tsconfig: "./tsconfig.json",
			compilerOptions: {
				"target": "es2016",
				"rootDir": "src",
				"baseUrl": "src/",
				"esModuleInterop": true,
				"forceConsistentCasingInFileNames": true,
				"strict": true,
				"skipLibCheck": true,
				"jsx": "react",
				"module": "ESNext",
				"declaration": true,
				"declarationDir": "dist",
				"sourceMap": false,
				"moduleResolution": "node",
				"allowSyntheticDefaultImports": true,
				"emitDeclarationOnly": true,
				"outDir": null,
			}
		}),
	]
};