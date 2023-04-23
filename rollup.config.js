import path from 'path';
import fs from 'fs';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import clear from 'rollup-plugin-clear';
import postcss from 'rollup-plugin-postcss';
import glob from 'glob';

const emitStyleFilePlugin = function () {
  return {
    pre(state) {
      this.cache = new Map();
      this.cache.set('lessFiles', new Set());
      this.cache.set('cssFiles', new Set());
    },
    visitor: {
      StringLiteral(path, state) {
        const value = path.node.value;
        if (/^antd\/(lib|es)/.test(value) && ['CallExpression', 'ImportDeclaration'].includes(path.parent.type)) {
          const { format = 'es' } = state.opts;
          const targetDir = format === 'es' ? 'es' : 'lib';
          path.node.value = value.replace(/^antd\/(lib|es)/, `antd/${targetDir}`);
          if (/^antd\/(lib|es)\/.*?\/style/.test(value)) {
            path.parentPath.remove();
            const lessFile = path.node.value.replace(/\/css$/, '');
            const cssFile = `${lessFile}/css`;
            this.cache.get('lessFiles').add(lessFile);
            this.cache.get('cssFiles').add(cssFile);
          }
        }
      },
    },
    post(state) {
      const lessFiles = this.cache.get('lessFiles');
      const cssFiles = this.cache.get('cssFiles');
      lessFiles.add('./index.css');
      cssFiles.add('./index.css');
      const { format = 'es', dir } = this.opts;
      const styleDir = path.resolve(`${format === 'es' ? 'es' : 'lib'}/${dir}/style`);
      if (!fs.existsSync(styleDir)) {
        fs.mkdirSync(styleDir, { recursive: true });
      }

      const generateCode = (files) =>
        [...files].map((str) => (format === 'es' ? `import '${str}';` : `require('${str}');`)).join('\n');

      fs.writeFileSync(path.join(styleDir, 'css.js'), generateCode(cssFiles));
      fs.writeFileSync(path.join(styleDir, 'index.js'), generateCode(lessFiles));
      fs.writeFileSync(path.join(styleDir, 'index.css'), '');
    },
  };
};

export default [
  ...glob.sync('src/*/index.ts?(x)').map((input) => {
    const [, dir] = /src\/(.*?)\//.exec(input);
    return {
      input,
      output: [
        {
          format: 'es',
          file: `es/${dir}/index.js`,
          plugins: [getBabelOutputPlugin({ plugins: [[emitStyleFilePlugin, { dir }]] })],
        },
        {
          format: 'cjs',
          file: `lib/${dir}/index.js`,
          exports: 'named',
          plugins: [getBabelOutputPlugin({ plugins: [[emitStyleFilePlugin, { format: 'cjs', dir }]] })],
        },
      ],
      plugins: [
        clear({
          targets: [`es/${dir}`, `lib/${dir}`],
          watch: true,
        }),
        alias({
          entries: {
            '@': path.resolve('src'),
          },
        }),
        resolve({ extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
        // commonjs(),
        babel({ babelHelpers: 'runtime', extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
        postcss({
          extract: 'style/index.css',
          modules: {
            generateScopedName: '[folder]__[name]__[local]',
          },
          autoModules: false,
          extensions: ['.css', '.less'],
        }),
      ],
      external: [/^react/, /^antd/, /^@babel\/runtime-corejs3/],
    };
  }),
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'es',
        file: 'es/index.js',
      },
      {
        format: 'cjs',
        file: 'lib/index.js',
        exports: 'named',
      },
    ],
    plugins: [
      resolve({ extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
      babel({ babelHelpers: 'runtime', extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
    ],
    external: [/src\/.*?\//, /node_modules/],
  },
];
