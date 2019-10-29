module.exports = {
    'env': {
        'commonjs': true,
        'es6': true,
        'node': true,
        'jest': true
    },
    'extends': 'airbnb',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018
    },
    'rules': {
        'indent': [
            'error',
            2
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'never'
        ],
        'no-console':0,
        'no-underscore-dangle': 0
    }
}