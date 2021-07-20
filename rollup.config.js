import svelte from 'rollup-plugin-svelte'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import sveltePreprocess from 'svelte-preprocess'
import typescript from '@rollup/plugin-typescript'
import manifestJson from 'rollup-plugin-manifest-json'
import pack from './package.json'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import clean from 'rollup-plugin-delete'
import copy from 'rollup-plugin-copy'
import path from 'path'

const production = !process.env.ROLLUP_WATCH

export default [
    {
        input: 'src/main.ts',
        output: {
            sourcemap: false,
            format: 'iife',
            name: 'r20dndsheet',
            file: 'dist/bundle.js',
        },
        plugins: [
            clean({
                targets: 'dist/*',
                runOnce: true,
            }),
            svelte({
                preprocess: sveltePreprocess({
                    sourceMap: !production,
                }),
                compilerOptions: {
                    dev: !production,
                },
            }),
            postcss({
                extract: true,
                extract: path.resolve('dist/bundle.css'),
                plugins: [autoprefixer()],
            }),
            resolve({
                browser: true,
                dedupe: ['svelte'],
            }),
            commonjs(),
            typescript({
                sourceMap: false,
            }),
            manifestJson({
                input: 'manifest.json',
                minify: true,
                manifest: {
                    version: pack.version,
                    description: pack.description,
                },
            }),
            production && terser(),
        ],
        watch: {
            clearScreen: false,
        },
    },
    {
        input: 'src/injector.ts',
        output: {
            sourcemap: false,
            format: 'cjs',
            file: 'dist/injector.js',
        },
        plugins: [
            commonjs(),
            typescript({
                sourceMap: false,
            }),
            copy({
                targets: [
                    {
                        src: 'src/wshook.js',
                        dest: 'dist',
                    },
                    {
                        src: 'src/icon.png',
                        dest: 'dist',
                    },
                ],
                copyOnce: true,
            }),
            production && terser(),
        ],
    },
]
