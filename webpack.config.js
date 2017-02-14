var path = require('path');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: 'dist'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json', '.glsl'],
        modules: [
            'src',
            'node_modules'
        ],
        alias: {
            'src': 'src'
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|vue)$/,
                loader: 'eslint-loader',
                enforce: "pre",
                include: ['src', 'components'],
                options: {
                    formatter: require('eslint-friendly-formatter')
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl-loader'
            }
        ]

    }
};
