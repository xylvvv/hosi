import { defineConfig } from 'dumi'
import path from 'path'
import pkg from '../package.json'

export default defineConfig({
    title: 'zafuru',
    mode: 'site',
    mfsu: {},
    resolve: {
        includes: ['docs']
    },
    alias: {
        [pkg.name]: path.resolve('.', 'src/index.ts')
    },
    extraBabelPlugins: [
        [
            'import',
            {
                libraryName: 'antd',
                libraryDirectory: 'es',
                style: true
            }
        ],
        [
            'react-css-modules',
            {
                filetypes: {
                    '.less': {
                        syntax: 'postcss-less'
                      }
                },
                generateScopedName: '[folder]__[name]__[local]',
                handleMissingStyleName: 'warn'
            }
        ]
    ],
    cssLoader: {
        modules: {
            localIdentName: '[folder]__[name]__[local]',
            auto: /src/
        }
    },
    chainWebpack(memo) {
        memo.resolve.alias.set('@', path.resolve('src'))
    }
})